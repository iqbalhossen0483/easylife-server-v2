import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

const mockUser = {
  id: 1,
  name: 'Test User',
  phone: '01853860483',
  password: 'hashed',
  designation: 'admin',
  have_money: 0,
  created_by: null,
  created_at: new Date(),
};

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((d) => ({ id: 2, ...d })),
  save: jest.fn().mockImplementation((d) => d),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
  count: jest.fn().mockResolvedValue(1),
  increment: jest.fn(),
  decrement: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let mockRepo: ReturnType<typeof createMockRepo>;

  beforeEach(() => {
    mockRepo = createMockRepo();
    const mockQrRepo = createMockRepo();

    const mockQr = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { getRepository: jest.fn().mockReturnValue(mockQrRepo) },
    };

    service = new UsersService({
      getRepository: jest.fn().mockResolvedValue(mockRepo),
      createQueryRunner: jest.fn().mockResolvedValue(mockQr),
      updateTenantCount: jest.fn(),
    } as any);
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.createUser(
        { name: 'New', phone: '01700000000', password: 'pass123', address: 'St', designation: 'sales_man' as any },
        1,
      );
      expect(result.success).toBe(true);
    });

    it('should throw ConflictException for duplicate phone', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.createUser(
          { name: 'Dup', phone: '01853860483', password: 'p', address: 'S', designation: 'sales_man' as any },
          1,
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getAllUser', () => {
    it('should return paginated users', async () => {
      mockRepo.find.mockResolvedValue([mockUser]);
      mockRepo.count.mockResolvedValue(1);
      const result = await service.getAllUser({ page: 1, limit: 10, search: '' });
      expect(result.success).toBe(true);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getSingleUser', () => {
    it('should return user', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.getSingleUser(1);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.getSingleUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update successfully', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.updateUser(1, { name: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.updateUser(999, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for phone conflict', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(mockUser) // user exists
        .mockResolvedValueOnce({ ...mockUser, id: 99 }); // phone taken
      await expect(service.updateUser(1, { phone: '01853860483' })).rejects.toThrow(ConflictException);
    });
  });

  describe('softDeleteUser', () => {
    it('should delete', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.softDeleteUser(1);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.softDeleteUser(999)).rejects.toThrow(NotFoundException);
    });
  });
});
