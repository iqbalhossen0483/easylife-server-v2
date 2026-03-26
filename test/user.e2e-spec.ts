import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('User Management (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdUserId: number;
  const tenantId = '1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login as admin
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('x-tenant-id', tenantId)
      .send({ phone: '01853860483', password: 'Iqbal0483' });

    adminToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/user/create', () => {
    it('should create user as admin', async () => {
      const phone = `017${Date.now().toString().slice(-8)}`;
      const res = await request(app.getHttpServer())
        .post('/api/user/create')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test User',
          phone,
          password: 'test123',
          address: 'Test Address',
          designation: 'sales_man',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      createdUserId = res.body.data.id;
    });

    it('should fail without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/user/create')
        .set('x-tenant-id', tenantId)
        .send({
          name: 'Fail',
          phone: '01700000001',
          password: 'test123',
          address: 'Addr',
          designation: 'sales_man',
        })
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/user/create')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' }) // missing required fields
        .expect(400);
    });
  });

  describe('GET /api/user/all', () => {
    it('should return paginated users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/user/all')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
    });

    it('should search users', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/user/all')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'E2E' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/user/single-user/:id', () => {
    it('should return single user', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/user/single-user/${createdUserId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('E2E Test User');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/user/single-user/99999')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/user/update/:id', () => {
    it('should update user', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/user/update/${createdUserId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated E2E User' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/user/delete/:id', () => {
    it('should soft delete user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/user/delete/${createdUserId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
