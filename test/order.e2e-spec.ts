import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Order Management (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let orderId: number;
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

  describe('POST /api/order/create', () => {
    it('should create order', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/order/create')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shop_id: 1,
          delivered_by: 1,
          products: [
            {
              product_id: 1,
              product_name: 'Test Product',
              qty: 2,
              price: 500,
              total: 1000,
            },
          ],
          total_sale: 1000,
          payment: 500,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      orderId = res.body.data.id;
    });

    it('should fail if products total does not match total_sale', async () => {
      await request(app.getHttpServer())
        .post('/api/order/create')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shop_id: 1,
          delivered_by: 1,
          products: [
            { product_id: 1, product_name: 'X', qty: 2, price: 500, total: 1000 },
          ],
          total_sale: 9999,
          payment: 0,
        })
        .expect(400);
    });

    it('should fail if payment exceeds total_sale', async () => {
      await request(app.getHttpServer())
        .post('/api/order/create')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shop_id: 1,
          delivered_by: 1,
          products: [
            { product_id: 1, product_name: 'X', qty: 1, price: 100, total: 100 },
          ],
          total_sale: 100,
          payment: 999,
        })
        .expect(400);
    });
  });

  describe('GET /api/order/all', () => {
    it('should return orders with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/order/all')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/order/all')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'undelivered' })
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/order/deliver/:id', () => {
    it('should deliver order', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .put(`/api/order/deliver/${orderId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should fail to deliver already delivered order', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .put(`/api/order/deliver/${orderId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/order/collect/:id', () => {
    it('should collect payment', async () => {
      if (!orderId) return;
      const res = await request(app.getHttpServer())
        .put(`/api/order/collect/${orderId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 100 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.remaining_due).toBeDefined();
    });

    it('should fail if discount exceeds 2%', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .put(`/api/order/collect/${orderId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ amount: 10, discount: 999 })
        .expect(400);
    });
  });

  describe('DELETE /api/order/delete/:id', () => {
    it('should fail to delete delivered order', async () => {
      if (!orderId) return;
      await request(app.getHttpServer())
        .delete(`/api/order/delete/${orderId}`)
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /api/order/my-collections', () => {
    it('should return user collections', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/order/my-collections')
        .set('x-tenant-id', tenantId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
