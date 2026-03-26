import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { ProductEntity } from 'src/entites/product.entity';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import {
  CreateProductDto,
  GetAllProductDto,
  UpdateProductDto,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  private deleteOldImage(filename: string | null | undefined) {
    if (!filename) return;
    const filePath = join(process.cwd(), 'public', filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  async createProduct(payload: CreateProductDto) {
    const productRepo =
      await this.tenantDbService.getRepository(ProductEntity);

    const existing = await productRepo.findOne({
      where: { name: payload.name },
    });
    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    const product = productRepo.create(payload);
    await productRepo.save(product);

    // Increment tenant product count
    await this.tenantDbService.updateTenantCount('current_product', true);

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  }

  async getAllProducts({ page = 1, limit = 10, search }: GetAllProductDto) {
    const skip = (page - 1) * limit;

    const query: FindOptionsWhere<ProductEntity>[] = [];
    if (search) {
      query.push({ name: ILike(`%${search}%`) });
      query.push({ short_name: ILike(`%${search}%`) });
    }

    const productRepo =
      await this.tenantDbService.getRepository(ProductEntity);

    const [products, total] = await productRepo.findAndCount({
      where: query.length ? query : undefined,
      order: { sl: 'ASC', created_at: 'DESC' },
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
      message: 'Products fetched successfully',
      data: products,
      meta,
    };
  }

  async getSingleProduct(productId: number) {
    const productRepo =
      await this.tenantDbService.getRepository(ProductEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product fetched successfully',
      data: product,
    };
  }

  async updateProduct(productId: number, payload: UpdateProductDto) {
    const productRepo =
      await this.tenantDbService.getRepository(ProductEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (payload.name) {
      const existing = await productRepo.findOne({
        where: { name: payload.name },
      });
      if (existing && existing.id !== productId) {
        throw new ConflictException('Product name already in use');
      }
    }

    // Delete old profile image if new one is uploaded
    if (payload.profile && product.profile) {
      this.deleteOldImage(product.profile);
    }

    await productRepo.update({ id: productId }, payload);

    return {
      success: true,
      message: 'Product updated successfully',
    };
  }

  async deleteProduct(productId: number) {
    const productRepo =
      await this.tenantDbService.getRepository(ProductEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const result = await productRepo.softDelete({ id: productId });
    if (result.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    // Decrement tenant product count
    await this.tenantDbService.updateTenantCount('current_product', false);

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
