import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

const hashedPassword = bcrypt.hashSync('Iqbal0483', 10);

const mockUser = {
  id: 1,
  name: 'Test User',
  phone: '01853860483',
  password: hashedPassword,
  designation: 'admin',
};

const mockRepo = { findOne: jest.fn() };

const mockTenantDb = {
  getRepository: jest.fn().mockResolvedValue(mockRepo),
  getDataDatabase: jest.fn().mockResolvedValue({ id: 1, name: 'test_db' }),
  getTenantId: jest.fn().mockReturnValue(1),
  getCurrentUserId: jest.fn().mockReturnValue(1),
};

const mockJwt = { sign: jest.fn().mockReturnValue('mock-token') };
const mockConfig = { get: jest.fn().mockReturnValue('development') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(
      mockJwt as unknown as JwtService,
      mockTenantDb as any,
      mockConfig as unknown as ConfigService,
    );
    jest.clearAllMocks();
    mockJwt.sign.mockReturnValue('mock-token');
  });

  describe('login', () => {
    const mockRes = { cookie: jest.fn() } as any;

    it('should login successfully', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockUser });
      const result = await service.login({ phone: '01853860483', password: 'Iqbal0483' }, mockRes);
      expect(result.success).toBe(true);
      expect(result.data.token).toBe('mock-token');
      expect(mockRes.cookie).toHaveBeenCalled();
    });

    it('should throw for wrong password', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockUser });
      await expect(
        service.login({ phone: '01853860483', password: 'wrong' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for non-existent user', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ phone: '00000000000', password: 'any' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateToken', () => {
    it('should call jwtService.sign with correct payload', () => {
      service.generateToken(mockUser as any, 1);
      expect(mockJwt.sign).toHaveBeenCalledWith({
        sub: 1, tenantId: 1, phone: '01853860483', designation: 'admin',
      });
    });
  });

  describe('logout', () => {
    it('should clear cookie', () => {
      const res = { clearCookie: jest.fn() } as any;
      const result = service.logout(res);
      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(result.success).toBe(true);
    });
  });

  describe('getProfile', () => {
    it('should return profile', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockUser });
      const res = { cookie: jest.fn() } as any;
      const result = await service.getProfile(res);
      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
    });

    it('should throw if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile({ cookie: jest.fn() } as any)).rejects.toThrow(UnauthorizedException);
    });
  });
});
