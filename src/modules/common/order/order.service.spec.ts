import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn().mockImplementation((d) => ({ id: 1, ...d })),
  save: jest.fn().mockImplementation((d) => d),
  update: jest.fn(),
  softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn(),
  count: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
};

const mockQr = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: { getRepository: jest.fn().mockReturnValue(mockRepo) },
};

const mockTenantDb = {
  getRepository: jest.fn().mockResolvedValue(mockRepo),
  createQueryRunner: jest.fn().mockResolvedValue(mockQr),
};

const mockReportService = {
  updateCashReport: jest.fn(),
  updateStockReport: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService(mockTenantDb as any, mockReportService as any);
    jest.clearAllMocks();
    mockRepo.create.mockImplementation((d) => ({ id: 1, ...d }));
    mockRepo.save.mockImplementation((d) => d);
  });

  describe('createOrder', () => {
    const validPayload = {
      shop_id: 1,
      delivered_by: 2,
      products: [
        { product_id: 1, product_name: 'Coffee', qty: 5, price: 100, total: 500 },
      ],
      total_sale: 500,
      payment: 200,
    };

    it('should create order successfully', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1, shop_name: 'Shop' }) // customer
        .mockResolvedValueOnce({ id: 2, name: 'Delivery Guy' }); // delivery user

      const result = await service.createOrder(validPayload, 1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
    });

    it('should throw if customer not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.createOrder(validPayload, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw if products total does not match total_sale', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const badPayload = { ...validPayload, total_sale: 999 };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw if payment exceeds total_sale', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const badPayload = { ...validPayload, payment: 9999 };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw if product qty*price does not match total', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const badPayload = {
        ...validPayload,
        products: [{ product_id: 1, product_name: 'X', qty: 5, price: 100, total: 999 }],
        total_sale: 999,
      };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deliverOrder', () => {
    const mockOrder = {
      id: 1,
      status: 'undelivered',
      total_sale: 500,
      payment: 200,
      due: 300,
      shop: { id: 1 },
      delivered_by: { id: 2 },
      created_by: { id: 3 },
      products: [{ product_id: 1, qty: 5 }],
    };

    it('should deliver order and trigger side effects', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOrder });

      const result = await service.deliverOrder(1);
      expect(result.success).toBe(true);
      expect(mockQr.commitTransaction).toHaveBeenCalled();
      expect(mockReportService.updateCashReport).toHaveBeenCalled();
      expect(mockReportService.updateStockReport).toHaveBeenCalled();
    });

    it('should throw if already delivered', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOrder, status: 'delivered' });

      await expect(service.deliverOrder(1)).rejects.toThrow(BadRequestException);
      expect(mockQr.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw if order not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.deliverOrder(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('collectPayment', () => {
    const mockDeliveredOrder = {
      id: 1,
      status: 'delivered',
      total_sale: 500,
      payment: 200,
      due: 300,
      discount: 0,
      shop: { id: 1 },
      delivered_by: { id: 2 },
    };

    it('should collect payment successfully', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockDeliveredOrder });

      const result = await service.collectPayment(
        1,
        { amount: 100, discount: 0 },
        1,
      );
      expect(result.success).toBe(true);
      expect(mockQr.commitTransaction).toHaveBeenCalled();
    });

    it('should throw if amount exceeds due', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockDeliveredOrder });

      await expect(
        service.collectPayment(1, { amount: 999 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if discount exceeds 2% of due', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockDeliveredOrder });

      // 2% of 300 = 6. Discount 10 should fail.
      await expect(
        service.collectPayment(1, { amount: 100, discount: 10 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if order not delivered', async () => {
      mockRepo.findOne.mockResolvedValue({
        ...mockDeliveredOrder,
        status: 'undelivered',
      });

      await expect(
        service.collectPayment(1, { amount: 100 }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOrder', () => {
    it('should delete undelivered order', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, status: 'undelivered' });

      const result = await service.deleteOrder(1);
      expect(result.success).toBe(true);
    });

    it('should throw if order is delivered', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, status: 'delivered' });

      await expect(service.deleteOrder(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteOrder(999)).rejects.toThrow(NotFoundException);
    });
  });
});
