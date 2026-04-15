import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { ProductEntity } from '@/entites/product.entity';
import {
  ProductionEntity,
  ProductionProductEntity,
} from '@/entites/production.entity';
import { UserEntity } from '@/entites/user.entity';
import { ReportUpdateService } from '@/services/report-update.service';
import { API_Meta } from '@/types/common';
import { clampLimit } from '@/utils/file.util';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere } from 'typeorm';
import { CreateProductionDto, GetAllProductionDto } from './production.dto';

@Injectable()
export class ProductionService {
  constructor(
    private readonly tenantDbService: TenantDatabaseService,
    private readonly reportService: ReportUpdateService,
  ) {}

  async createProduction(payload: CreateProductionDto, currentUserId: number) {
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);

    // Verify main product exists
    const mainProduct = await productRepo.findOne({
      where: { id: payload.product_id },
    });
    if (!mainProduct) throw new NotFoundException('Main product not found');

    // Build component records
    const components = payload.components.map((c) => {
      const pp = new ProductionProductEntity();
      pp.product_id = c.product_id;
      pp.product_name = c.product_name;
      pp.qty = c.qty;
      return pp;
    });

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const prodRepo = qr.manager.getRepository(ProductionEntity);
      const prodProductRepo = qr.manager.getRepository(ProductEntity);

      const production = prodRepo.create({
        product_id: payload.product_id,
        product_name: payload.product_name,
        production: payload.production,
        production_by: { id: currentUserId } as UserEntity,
        components,
      });

      await prodRepo.save(production);

      // Increase main product stock
      await prodProductRepo.increment(
        { id: payload.product_id },
        'stock',
        payload.production,
      );
      await prodProductRepo.increment(
        { id: payload.product_id },
        'production',
        payload.production,
      );

      // Decrease component stocks
      for (const comp of payload.components) {
        await prodProductRepo.decrement(
          { id: comp.product_id },
          'stock',
          comp.qty,
        );
      }

      // Update stock report for main product
      const updatedProduct = await prodProductRepo.findOne({
        where: { id: payload.product_id },
      });
      if (updatedProduct) {
        await this.reportService.updateStockReport(
          payload.product_id,
          0,
          0,
          updatedProduct.stock,
          qr.manager,
        );
      }

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Production recorded successfully',
        data: production,
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getAllProductions({
    page = 1,
    limit = 10,
    product_id,
  }: GetAllProductionDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;
    const productionRepo =
      await this.tenantDbService.getRepository(ProductionEntity);

    const query: FindOptionsWhere<ProductionEntity> = {};
    if (product_id) query.product_id = product_id;

    const [productions, total] = await productionRepo.findAndCount({
      where: query,
      relations: { production_by: true, components: true },
      select: {
        production_by: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: limit,
      skip,
    });

    const meta: API_Meta = {
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Productions fetched successfully',
      data: productions,
      meta,
    };
  }
}
