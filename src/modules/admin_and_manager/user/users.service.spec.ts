import { Designation } from '@/entites/user.entity';
import { JWT_Payload } from '@/types/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    createUser: jest.fn(),
    getSingleUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user from controller', async () => {
    mockUsersService.createUser.mockResolvedValue({
      success: true,
      message: 'User created',
    });

    const dto = {
      name: 'Iqbal',
      phone: '01700000000',
      password: '123456',
      address: 'Dhaka',
      designation: Designation.SALES_MAN,
    };
    const mockUser: JWT_Payload = {
      designation: Designation.SALES_MAN,
      sub: 1,
      phone: '01700000000',
      tenantId: 1,
      jti: 1,
    };
    const mockFile = {
      fieldname: 'profile',
      originalname: 'avatar.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 1024,
      filename: 'avatar-123.png',
      path: '/uploads/avatar-123.png',
    } as Express.Multer.File;

    const result = await controller.create(dto, mockUser, mockFile);

    expect(result.success).toBe(true);
  });
});
