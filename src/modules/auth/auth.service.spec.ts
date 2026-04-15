// import { UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';

// describe('AuthController', () => {
//   let controller: AuthController;

//   const mockJwt = {
//     sign: jest.fn().mockReturnValue('mock-token'),
//   };

//   const mockConfig = {
//     get: jest.fn().mockReturnValue('development'),
//   };

//   const mockTenantDb = {
//     getRepository: jest.fn().mockReturnValue({
//       findOne: jest.fn(),
//     }),
//     getDataDatabase: jest.fn().mockResolvedValue({ id: 1 }),
//     getTenantId: jest.fn().mockReturnValue(1),
//     getCurrentUserId: jest.fn().mockReturnValue(1),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       providers: [
//         AuthService,
//         {
//           provide: JwtService,
//           useValue: mockJwt,
//         },
//         {
//           provide: ConfigService,
//           useValue: mockConfig,
//         },
//         {
//           provide: 'TENANT_DB', // change if your token differs
//           useValue: mockTenantDb,
//         },
//       ],
//     }).compile();

//     controller = module.get<AuthController>(AuthController);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('login', () => {
//     it('should login user', async () => {
//       const mockRes = { cookie: jest.fn() } as any;

//       const repo = mockTenantDb.getRepository();
//       repo.findOne.mockResolvedValue({
//         id: 1,
//         phone: '01853860483',
//         password: 'hashed',
//         designation: 'admin',
//       });

//       const result = await controller.login(
//         { phone: '01853860483', password: 'Iqbal0483' },
//         mockRes,
//       );

//       expect(result.success).toBe(true);
//       expect(mockRes.cookie).toHaveBeenCalled();
//     });

//     it('should throw unauthorized', async () => {
//       const mockRes = { cookie: jest.fn() } as any;

//       const repo = mockTenantDb.getRepository();
//       repo.findOne.mockResolvedValue(null);

//       await expect(
//         controller.login({ phone: '000', password: 'wrong' }, mockRes),
//       ).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('getProfile', () => {
//     it('should return profile', async () => {
//       const mockRes = { cookie: jest.fn() } as any;

//       const repo = mockTenantDb.getRepository();
//       repo.findOne.mockResolvedValue({
//         id: 1,
//         phone: '01853860483',
//       });

//       const result = await controller.getProfile(mockRes);

//       expect(result.success).toBe(true);
//     });
//   });

//   describe('logout', () => {
//     it('should clear cookie', () => {
//       expect(result.success).toBe(true);
//       expect(mockRes.clearCookie).toHaveBeenCalledWith('token');
//     });
//   });
// });
