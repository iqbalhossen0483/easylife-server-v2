import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { PurchaseEntity } from 'src/entites/purchase.entity';
import { SupplierEntity } from 'src/entites/supplier.entity';
import { API_Meta } from 'src/types/common';
import { deleteFile, clampLimit } from 'src/utils/file.util';
import { FindOptionsWhere, ILike } from 'typeorm';
import {
  CreateSupplierDto,
  GetAllSupplierDto,
  UpdateSupplierDto,
} from './supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async createSupplier(payload: CreateSupplierDto) {
    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const existing = await supplierRepo.findOne({
      where: { phone: payload.phone },
    });
    if (existing) {
      throw new ConflictException('Supplier with this phone already exists');
    }

    const supplier = supplierRepo.create(payload);
    await supplierRepo.save(supplier);

    return {
      success: true,
      message: 'Supplier created successfully',
      data: supplier,
    };
  }

  async getAllSuppliers({ page = 1, limit = 10, search }: GetAllSupplierDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;

    const query: FindOptionsWhere<SupplierEntity>[] = [];
    if (search) {
      query.push({ name: ILike(`%${search}%`) });
      query.push({ phone: ILike(`%${search}%`) });
    }

    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const [suppliers, total] = await supplierRepo.findAndCount({
      where: query.length ? query : undefined,
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
      message: 'Suppliers fetched successfully',
      data: suppliers,
      meta,
    };
  }

  async getSingleSupplier(supplierId: number) {
    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const supplier = await supplierRepo.findOne({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Include recent purchases
    const purchaseRepo =
      await this.tenantDbService.getRepository(PurchaseEntity);
    const purchases = await purchaseRepo.find({
      where: { supplier: { id: supplierId } },
      relations: { products: true },
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      success: true,
      message: 'Supplier fetched successfully',
      data: {
        ...supplier,
        purchases,
      },
    };
  }

  async updateSupplier(supplierId: number, payload: UpdateSupplierDto) {
    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const supplier = await supplierRepo.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    if (payload.phone) {
      const existing = await supplierRepo.findOne({
        where: { phone: payload.phone },
      });
      if (existing && existing.id !== supplierId) {
        throw new ConflictException('Phone number already in use');
      }
    }

    if (payload.profile && supplier.profile) {
      await deleteFile(supplier.profile);
    }

    await supplierRepo.update({ id: supplierId }, payload);

    return {
      success: true,
      message: 'Supplier updated successfully',
    };
  }

  async deleteSupplier(supplierId: number) {
    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const supplier = await supplierRepo.findOne({
      where: { id: supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const result = await supplierRepo.softDelete({ id: supplierId });
    if (result.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'Supplier deleted successfully',
    };
  }
}
