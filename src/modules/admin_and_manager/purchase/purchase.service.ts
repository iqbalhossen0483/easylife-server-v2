import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { ProductEntity } from 'src/entites/product.entity';
import {
  PurchaseCollectionEntity,
  PurchaseEntity,
  PurchaseProductEntity,
} from 'src/entites/purchase.entity';
import { SupplierEntity } from 'src/entites/supplier.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { FindOptionsWhere } from 'typeorm';
import {
  CreatePurchaseDto,
  GetAllPurchaseDto,
  PaySupplierDto,
} from './purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async createPurchase(payload: CreatePurchaseDto, fileNames: string[]) {
    const currentUserId = this.tenantDbService.getCurrentUserId();

    const supplierRepo = await this.tenantDbService.getRepository(SupplierEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const purchaseRepo = await this.tenantDbService.getRepository(PurchaseEntity);
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);

    const supplier = await supplierRepo.findOne({ where: { id: payload.supplier_id } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const currentUser = await userRepo.findOne({ where: { id: currentUserId } });

    const paymentAmount = payload.payment ?? 0;
    const dueAmount = payload.total_amount - paymentAmount;

    const purchaseProducts = payload.products.map((p) => {
      const pp = new PurchaseProductEntity();
      pp.product_id = p.product_id;
      pp.product_name = p.product_name;
      pp.qty = p.qty;
      pp.price = p.price;
      pp.total = p.total;
      return pp;
    });

    const purchase = purchaseRepo.create({
      supplier,
      purchased_by: currentUser,
      total_amount: payload.total_amount,
      payment: paymentAmount,
      due: dueAmount,
      payment_info: payload.payment_info,
      files: fileNames.length > 0 ? fileNames : undefined,
      products: purchaseProducts,
    });

    await purchaseRepo.save(purchase);

    // Update supplier financials
    await supplierRepo.increment({ id: supplier.id }, 'total_purchased', payload.total_amount);
    await supplierRepo.increment({ id: supplier.id }, 'give_amount', paymentAmount);
    await supplierRepo.increment({ id: supplier.id }, 'debt_amount', dueAmount);

    // Update product stock
    for (const item of payload.products) {
      await productRepo.increment({ id: item.product_id }, 'stock', item.qty);
      await productRepo.increment({ id: item.product_id }, 'purchased', item.qty);
    }

    // Update user cash balance
    if (currentUser && paymentAmount > 0) {
      await userRepo.decrement({ id: currentUser.id }, 'have_money', paymentAmount);
    }

    // TODO: Create transaction history, update cash/stock reports

    return {
      success: true,
      message: 'Purchase recorded successfully',
      data: purchase,
    };
  }

  async getAllPurchases({ page = 1, limit = 10, supplier_id }: GetAllPurchaseDto) {
    const skip = (page - 1) * limit;
    const purchaseRepo = await this.tenantDbService.getRepository(PurchaseEntity);

    const query: FindOptionsWhere<PurchaseEntity> = {};
    if (supplier_id) query.supplier = { id: supplier_id };

    const [purchases, total] = await purchaseRepo.findAndCount({
      where: query,
      relations: { supplier: true, purchased_by: true, products: true },
      select: {
        supplier: { id: true, name: true, phone: true },
        purchased_by: { id: true, name: true },
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
      message: 'Purchases fetched successfully',
      data: purchases,
      meta,
    };
  }

  async paySupplier(purchaseId: number, payload: PaySupplierDto) {
    const currentUserId = this.tenantDbService.getCurrentUserId();

    const purchaseRepo = await this.tenantDbService.getRepository(PurchaseEntity);
    const purchase = await purchaseRepo.findOne({
      where: { id: purchaseId },
      relations: { supplier: true },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    if (payload.amount > purchase.due) {
      throw new BadRequestException('Amount exceeds remaining due');
    }

    // Create payment record
    const pcRepo = await this.tenantDbService.getRepository(PurchaseCollectionEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const sender = await userRepo.findOne({ where: { id: currentUserId } });

    const collection = pcRepo.create({
      purchase,
      sender,
      amount: payload.amount,
      notes: payload.notes,
    });
    await pcRepo.save(collection);

    // Update purchase
    purchase.payment = Number(purchase.payment) + payload.amount;
    purchase.due = Number(purchase.due) - payload.amount;
    await purchaseRepo.save(purchase);

    // Update supplier
    const supplierRepo = await this.tenantDbService.getRepository(SupplierEntity);
    await supplierRepo.increment({ id: purchase.supplier.id }, 'give_amount', payload.amount);
    await supplierRepo.decrement({ id: purchase.supplier.id }, 'debt_amount', payload.amount);

    // Update user balance
    if (sender) {
      await userRepo.decrement({ id: sender.id }, 'have_money', payload.amount);
    }

    // TODO: Update cash reports

    return {
      success: true,
      message: 'Supplier payment recorded successfully',
      data: { remaining_due: purchase.due },
    };
  }
}
