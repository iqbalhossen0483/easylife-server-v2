import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { ReportUpdateService } from 'src/services/report-update.service';
import { OrderService } from './order.service';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest
    .fn()
    .mockImplementation((d: Record<string, unknown>) => ({ id: 1, ...d })),
  save: jest.fn().mockImplementation((d: Record<string, unknown>) => d),
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
    service = new OrderService(
      mockTenantDb as unknown as TenantDatabaseService,
      mockReportService as unknown as ReportUpdateService,
    );
    jest.clearAllMocks();
    mockRepo.create.mockImplementation((d: Record<string, unknown>) => ({
      id: 1,
      ...d,
    }));
    mockRepo.save.mockImplementation((d: Record<string, unknown>) => d);
  });

  describe('createOrder', () => {
    const validPayload = {
      shop_id: 1,
      delivered_by: 2,
      products: [
        {
          product_id: 1,
          product_name: 'Coffee',
          qty: 5,
          price: 100,
          total: 500,
          is_free: false,
        },
      ],
      total_sale: 500,
      payment: 200,
    };

    it('should create order successfully', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1, shop_name: 'Shop' }) // customer
        .mockResolvedValueOnce({ id: 2, name: 'Delivery Guy' }) // delivery user
        .mockResolvedValueOnce({ id: 1, name: 'Coffee', stock: 100 }); // product validation

      const result = await service.createOrder(validPayload, 1);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
    });

    it('should throw if customer not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.createOrder(validPayload, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if product does not exist', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 }) // customer
        .mockResolvedValueOnce({ id: 2 }) // delivery user
        .mockResolvedValueOnce(null); // product not found

      await expect(service.createOrder(validPayload, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if product has insufficient stock', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 }) // customer
        .mockResolvedValueOnce({ id: 2 }) // delivery user
        .mockResolvedValueOnce({ id: 1, name: 'Coffee', stock: 2 }); // only 2 in stock, need 5

      await expect(service.createOrder(validPayload, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if products total does not match total_sale', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 }) // customer
        .mockResolvedValueOnce({ id: 2 }) // delivery user
        .mockResolvedValueOnce({ id: 1, name: 'Coffee', stock: 100 }); // product valid

      const badPayload = { ...validPayload, total_sale: 999 };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if payment exceeds total_sale', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 })
        .mockResolvedValueOnce({ id: 1, name: 'Coffee', stock: 100 });

      const badPayload = { ...validPayload, payment: 9999 };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if product qty*price does not match total', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 })
        .mockResolvedValueOnce({ id: 1, name: 'X', stock: 100 });

      const badPayload = {
        ...validPayload,
        products: [
          {
            product_id: 1,
            product_name: 'X',
            qty: 5,
            price: 100,
            total: 999,
            is_free: false,
          },
        ],
        total_sale: 999,
      };
      await expect(service.createOrder(badPayload, 1)).rejects.toThrow(
        BadRequestException,
      );
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

      await expect(service.deliverOrder(1)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQr.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw if order not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.deliverOrder(999)).rejects.toThrow(
        NotFoundException,
      );
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

  describe('deliverOrder — customer commission on target', () => {
    it('should apply customer commission 60% to target achived_amnt (same user)', async () => {
      const order = {
        id: 1,
        status: 'undelivered',
        total_sale: 10000,
        payment: 5000,
        due: 5000,
        shop: { id: 1, commission: 60 },
        delivered_by: { id: 2 },
        created_by: { id: 2 }, // same user
        products: [{ product_id: 1, qty: 10 }],
      };

      const targetRecord = {
        id: 1,
        achived_amnt: 0,
        status: 'running',
      };

      mockRepo.findOne
        .mockResolvedValueOnce(order) // order lookup
        .mockResolvedValueOnce(targetRecord) // delivery user target
        .mockResolvedValueOnce({ id: 1, stock: 90 }); // product for stock report

      await service.deliverOrder(1);

      // 10000 * 60% = 6000, same user gets full amount
      expect(targetRecord.achived_amnt).toBe(6000);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ achived_amnt: 6000 }),
      );
    });

    it('should apply customer commission 100% (default) to target', async () => {
      const order = {
        id: 2,
        status: 'undelivered',
        total_sale: 10000,
        payment: 5000,
        due: 5000,
        shop: { id: 1, commission: 100 },
        delivered_by: { id: 2 },
        created_by: { id: 2 },
        products: [{ product_id: 1, qty: 5 }],
      };

      const targetRecord = { id: 1, achived_amnt: 0, status: 'running' };

      mockRepo.findOne
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(targetRecord)
        .mockResolvedValueOnce({ id: 1, stock: 95 });

      await service.deliverOrder(2);

      // 10000 * 100% = 10000
      expect(targetRecord.achived_amnt).toBe(10000);
    });

    it('should split 50/50 with commission applied (different users)', async () => {
      const order = {
        id: 3,
        status: 'undelivered',
        total_sale: 10000,
        payment: 5000,
        due: 5000,
        shop: { id: 1, commission: 40 },
        delivered_by: { id: 2 },
        created_by: { id: 3 }, // different user
        products: [{ product_id: 1, qty: 5 }],
      };

      const deliveryTarget = { id: 1, achived_amnt: 0, status: 'running' };
      const creatorTarget = { id: 2, achived_amnt: 0, status: 'running' };

      mockRepo.findOne
        .mockResolvedValueOnce(order) // order
        .mockResolvedValueOnce(deliveryTarget) // delivery user target
        .mockResolvedValueOnce(creatorTarget) // creator target
        .mockResolvedValueOnce({ id: 1, stock: 95 }); // product

      await service.deliverOrder(3);

      // 10000 * 40% = 4000. Half = 2000 each.
      expect(deliveryTarget.achived_amnt).toBe(2000);
      expect(creatorTarget.achived_amnt).toBe(2000);
    });

    it('should apply commission 25% and handle odd split', async () => {
      const order = {
        id: 4,
        status: 'undelivered',
        total_sale: 10000,
        payment: 0,
        due: 10000,
        shop: { id: 1, commission: 25 },
        delivered_by: { id: 2 },
        created_by: { id: 3 },
        products: [{ product_id: 1, qty: 1 }],
      };

      const deliveryTarget = { id: 1, achived_amnt: 0, status: 'running' };
      const creatorTarget = { id: 2, achived_amnt: 0, status: 'running' };

      mockRepo.findOne
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(deliveryTarget)
        .mockResolvedValueOnce(creatorTarget)
        .mockResolvedValueOnce({ id: 1, stock: 99 });

      await service.deliverOrder(4);

      // 10000 * 25% = 2500. Half = 1250 each.
      expect(deliveryTarget.achived_amnt).toBe(1250);
      expect(creatorTarget.achived_amnt).toBe(1250);
    });

    it('should skip target update when commission is effectively 0', async () => {
      const order = {
        id: 5,
        status: 'undelivered',
        total_sale: 50,
        payment: 0,
        due: 50,
        shop: { id: 1, commission: 1 },
        delivered_by: { id: 2 },
        created_by: { id: 2 },
        products: [{ product_id: 1, qty: 1 }],
      };

      // 50 * 1% = 0.5 → rounds to 1, still > 0
      const targetRecord = { id: 1, achived_amnt: 0, status: 'running' };

      mockRepo.findOne
        .mockResolvedValueOnce(order)
        .mockResolvedValueOnce(targetRecord)
        .mockResolvedValueOnce({ id: 1, stock: 99 });

      await service.deliverOrder(5);

      expect(targetRecord.achived_amnt).toBe(1);
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
