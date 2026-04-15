// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { ExpenseService } from './expense.service';

// const mockRepo = {
//   find: jest.fn(),
//   findOne: jest.fn(),
//   findAndCount: jest.fn(),
//   create: jest.fn().mockImplementation((d) => ({ id: 1, ...d })),
//   save: jest.fn().mockImplementation((d) => d),
//   softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
//   increment: jest.fn(),
//   decrement: jest.fn(),
// };

// const mockQr = {
//   connect: jest.fn(),
//   startTransaction: jest.fn(),
//   commitTransaction: jest.fn(),
//   rollbackTransaction: jest.fn(),
//   release: jest.fn(),
//   manager: { getRepository: jest.fn().mockReturnValue(mockRepo) },
// };

// const mockTenantDb = {
//   getRepository: jest.fn().mockResolvedValue(mockRepo),
//   createQueryRunner: jest.fn().mockResolvedValue(mockQr),
// };

// const mockReportService = {
//   updateCashReport: jest.fn(),
// };

// describe('ExpenseService', () => {
//   let service: ExpenseService;

//   beforeEach(() => {
//     service = new ExpenseService(mockTenantDb as any, mockReportService as any);
//     jest.clearAllMocks();
//     mockRepo.create.mockImplementation((d) => ({ id: 1, ...d }));
//     mockRepo.save.mockImplementation((d) => d);
//   });

//   describe('submitExpense', () => {
//     it('should auto-approve for super_admin', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, designation: 'super_admin' }) // user
//         .mockResolvedValueOnce({ id: 1, name: 'Salary' }); // category

//       const result = await service.submitExpense(
//         { type_id: 1, amount: 5000 },
//         1,
//       );

//       expect(result.success).toBe(true);
//       expect(result.message).toBe('Expense approved and recorded');
//       expect(mockReportService.updateCashReport).toHaveBeenCalledWith(
//         'expense',
//         5000,
//       );
//     });

//     it('should set pending for non-admin', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 2, designation: 'sales_man' })
//         .mockResolvedValueOnce({ id: 1, name: 'Salary' });

//       const result = await service.submitExpense(
//         { type_id: 1, amount: 3000 },
//         2,
//       );

//       expect(result.success).toBe(true);
//       expect(result.message).toBe('Expense submitted for approval');
//       expect(mockReportService.updateCashReport).not.toHaveBeenCalled();
//     });

//     it('should throw if category not found', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, designation: 'super_admin' })
//         .mockResolvedValueOnce(null);

//       await expect(
//         service.submitExpense({ type_id: 999, amount: 100 }, 1),
//       ).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('approveExpense', () => {
//     it('should approve pending expense', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         id: 1,
//         status: 'pending',
//         amount: 5000,
//         created_by: { id: 2 },
//       });

//       const result = await service.approveExpense(1, 1);
//       expect(result.success).toBe(true);
//       expect(mockQr.commitTransaction).toHaveBeenCalled();
//     });

//     it('should throw if expense is not pending', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         id: 1,
//         status: 'approved',
//         amount: 5000,
//         created_by: { id: 2 },
//       });

//       await expect(service.approveExpense(1, 1)).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should throw if expense not found', async () => {
//       mockRepo.findOne.mockResolvedValue(null);
//       await expect(service.approveExpense(999, 1)).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('rejectExpense', () => {
//     it('should reject pending expense', async () => {
//       mockRepo.findOne.mockResolvedValue({ id: 1, status: 'pending' });

//       const result = await service.rejectExpense(1);
//       expect(result.success).toBe(true);
//       expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 1 });
//     });

//     it('should throw if not pending', async () => {
//       mockRepo.findOne.mockResolvedValue({ id: 1, status: 'approved' });
//       await expect(service.rejectExpense(1)).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });

//   describe('getAllExpenses', () => {
//     it('should return paginated expenses', async () => {
//       mockRepo.findAndCount.mockResolvedValue([[{ id: 1 }], 1]);

//       const result = await service.getAllExpenses({ page: 1, limit: 10 });
//       expect(result.success).toBe(true);
//       expect(result.meta.total).toBe(1);
//     });
//   });
// });
