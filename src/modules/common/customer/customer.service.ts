import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { CustomerEntity } from '@/entites/customer.entity';
import { OrderEntity } from '@/entites/order.entity';
import { UserEntity } from '@/entites/user.entity';
import { API_Meta } from '@/types/common';
import { clampLimit, deleteFile } from '@/utils/file.util';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import {
  CreateCustomerDto,
  GetAllCustomerDto,
  UpdateCustomerDto,
} from './customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async createCustomer(payload: CreateCustomerDto, currentUserId: number) {
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const existing = await customerRepo.findOne({
      where: { phone: payload.phone },
    });
    if (existing) {
      throw new ConflictException('Customer with this phone already exists');
    }

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const custRepo = qr.manager.getRepository(CustomerEntity);
      const customer = custRepo.create({
        ...payload,
        added_by: { id: currentUserId } as UserEntity,
      });
      await custRepo.save(customer);

      // Increment tenant customer count
      await this.tenantDbService.updateTenantCount('current_customer', true);

      await qr.commitTransaction();

      const { added_by, ...rest } = customer;

      return {
        success: true,
        message: 'Customer created successfully',
        data: rest,
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getAllCustomers({ page = 1, limit = 10, search }: GetAllCustomerDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;

    const query: FindOptionsWhere<CustomerEntity>[] = [];
    if (search) {
      query.push({ shop_name: ILike(`%${search}%`) });
      query.push({ address: ILike(`%${search}%`) });
      query.push({ phone: ILike(`%${search}%`) });
    }

    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const [customers, total] = await customerRepo.findAndCount({
      where: query.length ? query : undefined,
      relations: { added_by: true },
      select: {
        id: true,
        shop_name: true,
        address: true,
        phone: true,
        machine_type: true,
        machine_model: true,
        profile: true,
        commission: true,
        total_sale: true,
        due_sale: true,
        due: true,
        collection: true,
        discount: true,
        last_order: true,
        created_at: true,
        added_by: {
          id: true,
          name: true,
        },
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
      message: 'Customers fetched successfully',
      data: customers,
      meta,
    };
  }

  async getSingleCustomer(customerId: number) {
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const customer = await customerRepo.findOne({
      where: { id: customerId },
      relations: { added_by: true },
      select: {
        added_by: {
          id: true,
          name: true,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Include recent orders
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const orders = await orderRepo.find({
      where: { shop: { id: customerId } },
      order: { created_at: 'DESC' },
      take: 20,
    });

    return {
      success: true,
      message: 'Customer fetched successfully',
      data: {
        ...customer,
        orders,
      },
    };
  }

  async updateCustomer(customerId: number, payload: UpdateCustomerDto) {
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const customer = await customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (payload.phone) {
      const existing = await customerRepo.findOne({
        where: { phone: payload.phone },
      });
      if (existing && existing.id !== customerId) {
        throw new ConflictException('Phone number already in use');
      }
    }

    // Delete old profile image if new one is uploaded
    if (payload.profile && customer.profile) {
      await deleteFile(customer.profile);
    }

    await customerRepo.update({ id: customerId }, payload);

    return {
      success: true,
      message: 'Customer updated successfully',
    };
  }

  async softDeleteCustomer(customerId: number) {
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const customer = await customerRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const result = await customerRepo.softDelete({ id: customerId });
    if (result.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    // Decrement tenant customer count
    await this.tenantDbService.updateTenantCount('current_customer', false);

    return {
      success: true,
      message: 'Customer deleted successfully',
    };
  }
}
