// import { AppModule } from '@/app.module';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import request from 'supertest';

// describe('Auth (e2e)', () => {
//   let app: INestApplication;
//   let token: string;
//   const tenantId = '1';

//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();

//     app = moduleFixture.createNestApplication();
//     app.setGlobalPrefix('api');
//     app.useGlobalPipes(
//       new ValidationPipe({ whitelist: true, transform: true }),
//     );
//     await app.init();
//   });

//   afterAll(async () => {
//     await app.close();
//   });

//   describe('POST /api/auth/login', () => {
//     it('should login with valid credentials', async () => {
//       const res = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .set('x-tenant-id', tenantId)
//         .send({ phone: '01853860483', password: 'Iqbal0483' })
//         .expect(201);

//       expect(res.body.success).toBe(true);
//       expect(res.body.data.token).toBeDefined();
//       token = res.body.data.token;
//     });

//     it('should fail with wrong password', async () => {
//       const res = await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .set('x-tenant-id', tenantId)
//         .send({ phone: '01853860483', password: 'wrongpass' })
//         .expect(401);

//       expect(res.body.success).toBe(false);
//     });

//     it('should fail with missing fields', async () => {
//       await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .set('x-tenant-id', tenantId)
//         .send({})
//         .expect(400);
//     });

//     it('should fail without x-tenant-id header', async () => {
//       await request(app.getHttpServer())
//         .post('/api/auth/login')
//         .send({ phone: '01853860483', password: 'Iqbal0483' })
//         .expect(401);
//     });
//   });

//   describe('GET /api/auth/get-profile', () => {
//     it('should return profile with valid token', async () => {
//       const res = await request(app.getHttpServer())
//         .get('/api/auth/get-profile')
//         .set('x-tenant-id', tenantId)
//         .set('Authorization', `Bearer ${token}`)
//         .expect(200);

//       expect(res.body.success).toBe(true);
//       expect(res.body.data.user).toBeDefined();
//     });

//     it('should return 401 without token', async () => {
//       await request(app.getHttpServer())
//         .get('/api/auth/get-profile')
//         .set('x-tenant-id', tenantId)
//         .expect(401);
//     });
//   });

//   describe('POST /api/auth/logout', () => {
//     it('should logout successfully', async () => {
//       const res = await request(app.getHttpServer())
//         .post('/api/auth/logout')
//         .set('x-tenant-id', tenantId)
//         .set('Authorization', `Bearer ${token}`)
//         .expect(201);

//       expect(res.body.success).toBe(true);
//     });
//   });
// });
