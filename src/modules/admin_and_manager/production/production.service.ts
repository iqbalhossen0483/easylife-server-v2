import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { ProductEntity } from 'src/entites/product.entity';
import {
  ProductionEntity,
  ProductionProductEntity,
} from 'src/entites/production.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere } from 'typeorm';
import { CreateProductionDto, GetAllProductionDto } from './production.dto';

@Injectable()
export class ProductionService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async createProduction(payload: CreateProductionDto) {
    const currentUserId = this.tenantDbService.getCurrentUserId();
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const productionRepo = await this.tenantDbService.getRepository(ProductionEntity);

    const currentUser = await userRepo.findOne({ where: { id: currentUserId } });

    // Verify main product exists
    const mainProduct = await productRepo.findOne({ where: { id: payload.product_id } });
    if (!mainProduct) throw new NotFoundException('Main product not found');

    // Build component records
    const components = payload.components.map((c) => {
      const pp = new ProductionProductEntity();
      pp.product_id = c.product_id;
      pp.product_name = c.product_name;
      pp.qty = c.qty;
      return pp;
    });

    const production = productionRepo.create({
      product_id: payload.product_id,
      product_name: payload.product_name,
      production: payload.production,
      production_by: currentUser,
      components,
    });

    await productionRepo.save(production);

    // Increase main product stock
    await productRepo.increment({ id: payload.product_id }, 'stock', payload.production);
    await productRepo.increment({ id: payload.product_id }, 'production', payload.production);

    // Decrease component stocks
    for (const comp of payload.components) {
      await productRepo.decrement({ id: comp.product_id }, 'stock', comp.qty);
    }

    // TODO: Update stock reports when report entities are built

    return {
      success: true,
      message: 'Production recorded successfully',
      data: production,
    };
  }

  async getAllProductions({ page = 1, limit = 10, product_id }: GetAllProductionDto) {
    const skip = (page - 1) * limit;
    const productionRepo = await this.tenantDbService.getRepository(ProductionEntity);

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
