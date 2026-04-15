// import { Designation } from '@/entites/user.entity';
// import {
//   BadRequestException,
//   ForbiddenException,
//   NotFoundException,
// } from '@nestjs/common';
// import { TransactionService } from './transaction.service';

// const mockRepo = {
//   find: jest.fn(),
//   findOne: jest.fn(),
//   findAndCount: jest.fn(),
//   create: jest.fn().mockImplementation((d) => ({ id: 1, ...d })),
//   save: jest.fn().mockImplementation((d) => d),
//   delete: jest.fn(),
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

// describe('TransactionService', () => {
//   let service: TransactionService;

//   beforeEach(() => {
//     service = new TransactionService(mockTenantDb as any);
//     jest.clearAllMocks();
//     mockRepo.create.mockImplementation((d) => ({ id: 1, ...d }));
//     mockRepo.save.mockImplementation((d) => d);
//   });

//   describe('initiateTransfer', () => {
//     it('should initiate balance_transfer successfully', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, have_money: 10000, debt: 0 }) // sender
//         .mockResolvedValueOnce({ id: 2, name: 'Receiver' }); // recipient

//       const result = await service.initiateTransfer(
//         { to_user_id: 2, purpose: 'balance_transfer' as any, amount: 5000 },
//         1,
//         Designation.ADMIN,
//       );

//       expect(result.success).toBe(true);
//       expect(result.message).toContain('awaiting acceptance');
//     });

//     it('should throw if insufficient have_money', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, have_money: 100, debt: 0 })
//         .mockResolvedValueOnce({ id: 2 });

//       await expect(
//         service.initiateTransfer(
//           { to_user_id: 2, purpose: 'balance_transfer' as any, amount: 5000 },
//           1,
//           Designation.ADMIN,
//         ),
//       ).rejects.toThrow(BadRequestException);
//     });

//     it('should throw if insufficient debt for debt_payment', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, have_money: 10000, debt: 100 })
//         .mockResolvedValueOnce({ id: 2 });

//       await expect(
//         service.initiateTransfer(
//           { to_user_id: 2, purpose: 'debt_payment' as any, amount: 5000 },
//           1,
//           Designation.ADMIN,
//         ),
//       ).rejects.toThrow(BadRequestException);
//     });

//     it('should throw ForbiddenException for unauthorized transfer type', async () => {
//       await expect(
//         service.initiateTransfer(
//           { to_user_id: 2, purpose: 'salary' as any, amount: 5000 },
//           1,
//           Designation.ADMIN, // ADMIN cannot send salary
//         ),
//       ).rejects.toThrow(ForbiddenException);
//     });

//     it('should allow SUPER_ADMIN to send salary', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, have_money: 50000, debt: 0 })
//         .mockResolvedValueOnce({ id: 2 });

//       const result = await service.initiateTransfer(
//         { to_user_id: 2, purpose: 'salary' as any, amount: 10000 },
//         1,
//         Designation.SUPER_ADMIN,
//       );

//       expect(result.success).toBe(true);
//     });

//     it('should throw if transferring to self', async () => {
//       mockRepo.findOne
//         .mockResolvedValueOnce({ id: 1, have_money: 10000, debt: 0 }) // sender
//         .mockResolvedValueOnce({ id: 1 }); // recipient (same)

//       await expect(
//         service.initiateTransfer(
//           { to_user_id: 1, purpose: 'balance_transfer' as any, amount: 100 },
//           1,
//           Designation.ADMIN,
//         ),
//       ).rejects.toThrow(BadRequestException);
//     });
//   });

//   describe('acceptTransfer', () => {
//     const basePending = {
//       id: 1,
//       amount: 5000,
//       from_user: { id: 1 },
//       to_user: { id: 2 },
//     };

//     it('should handle BALANCE_TRANSFER correctly', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'balance_transfer',
//       });

//       const result = await service.acceptTransfer(1, 2);
//       expect(result.success).toBe(true);
//       expect(mockRepo.decrement).toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         5000,
//       );
//       expect(mockRepo.increment).toHaveBeenCalledWith(
//         { id: 2 },
//         'have_money',
//         5000,
//       );
//     });

//     it('should handle SALARY correctly', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'salary',
//       });

//       const result = await service.acceptTransfer(1, 2);
//       expect(result.success).toBe(true);
//       expect(mockRepo.decrement).toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         5000,
//       );
//       expect(mockRepo.increment).toHaveBeenCalledWith(
//         { id: 2 },
//         'get_salary',
//         5000,
//       );
//     });

//     it('should handle INCENTIVE correctly', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'incentive',
//       });

//       await service.acceptTransfer(1, 2);
//       expect(mockRepo.decrement).toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         5000,
//       );
//       expect(mockRepo.increment).toHaveBeenCalledWith(
//         { id: 2 },
//         'incentive',
//         5000,
//       );
//     });

//     it('should handle COMMISSION correctly', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'commission',
//       });

//       await service.acceptTransfer(1, 2);
//       expect(mockRepo.decrement).toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         5000,
//       );
//       expect(mockRepo.increment).toHaveBeenCalledWith(
//         { id: 2 },
//         'incentive',
//         5000,
//       );
//     });

//     it('should handle DEBT correctly', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'debt',
//       });

//       await service.acceptTransfer(1, 2);
//       expect(mockRepo.decrement).toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         5000,
//       );
//       expect(mockRepo.increment).toHaveBeenCalledWith({ id: 2 }, 'debt', 5000);
//     });

//     it('should handle DEBT_PAYMENT correctly — no deduction from sender have_money', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'debt_payment',
//       });

//       await service.acceptTransfer(1, 2);
//       // DEBT_PAYMENT: sender.debt -= amount, receiver.have_money += amount
//       expect(mockRepo.decrement).toHaveBeenCalledWith({ id: 1 }, 'debt', 5000);
//       expect(mockRepo.increment).toHaveBeenCalledWith(
//         { id: 2 },
//         'have_money',
//         5000,
//       );
//       // Should NOT decrement sender's have_money
//       expect(mockRepo.decrement).not.toHaveBeenCalledWith(
//         { id: 1 },
//         'have_money',
//         expect.anything(),
//       );
//     });

//     it('should throw if wrong recipient tries to accept', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         ...basePending,
//         purpose: 'balance_transfer',
//       });

//       await expect(service.acceptTransfer(1, 999)).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should throw if transfer not found', async () => {
//       mockRepo.findOne.mockResolvedValue(null);
//       await expect(service.acceptTransfer(999, 2)).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('declineTransfer', () => {
//     it('should decline successfully', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         id: 1,
//         to_user: { id: 2 },
//       });

//       const result = await service.declineTransfer(1, 2);
//       expect(result.success).toBe(true);
//       expect(mockRepo.delete).toHaveBeenCalledWith({ id: 1 });
//     });

//     it('should throw if wrong recipient declines', async () => {
//       mockRepo.findOne.mockResolvedValue({
//         id: 1,
//         to_user: { id: 2 },
//       });

//       await expect(service.declineTransfer(1, 999)).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });
// });
