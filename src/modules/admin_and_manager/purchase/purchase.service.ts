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
import { ReportUpdateService } from 'src/services/report-update.service';
import { API_Meta } from 'src/types/common';
import { clampLimit } from 'src/utils/file.util';
import { FindOptionsWhere } from 'typeorm';
import {
  CreatePurchaseDto,
  GetAllPurchaseDto,
  PaySupplierDto,
} from './purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    private readonly tenantDbService: TenantDatabaseService,
    private readonly reportService: ReportUpdateService,
  ) {}

  async createPurchase(
    payload: CreatePurchaseDto,
    fileNames: string[],
    currentUserId: number,
  ) {
    const supplierRepo =
      await this.tenantDbService.getRepository(SupplierEntity);

    const supplier = await supplierRepo.findOne({
      where: { id: payload.supplier_id },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const paymentAmount = payload.payment ?? 0;
    const dueAmount = payload.total_amount - paymentAmount;

    // validate user have enough balance
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: currentUserId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.have_money < paymentAmount)
      throw new BadRequestException('You have insufficient balance');

    // validate payment amount
    if (paymentAmount > payload.total_amount) {
      throw new BadRequestException(
        'Payment amount cannot be greater than total amount',
      );
    }

    // validate product listed in our database
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);
    for (const p of payload.products) {
      const product = await productRepo.findOne({
        where: { id: p.product_id },
      });
      if (!product) throw new NotFoundException('Product not found');
    }

    // validate product price * qty = total
    for (const p of payload.products) {
      if (p.price * p.qty !== p.total)
        throw new BadRequestException(
          'Product price * qty does not match total',
        );
    }

    // validate total product price matches total amount
    const calculatedTotal = payload.products.reduce(
      (sum, p) => sum + Number(p.total),
      0,
    );
    if (Math.abs(calculatedTotal - payload.total_amount) > 0.01) {
      throw new BadRequestException(
        `Products total (${calculatedTotal}) does not match total amount (${payload.total_amount})`,
      );
    }

    const purchaseProducts = payload.products.map((p) => {
      const pp = new PurchaseProductEntity();
      pp.product_id = p.product_id;
      pp.product_name = p.product_name;
      pp.qty = p.qty;
      pp.price = p.price;
      pp.total = p.total;
      return pp;
    });

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const purchaseRepo = qr.manager.getRepository(PurchaseEntity);
      const productRepo = qr.manager.getRepository(ProductEntity);
      const supRepo = qr.manager.getRepository(SupplierEntity);

      const purchase = purchaseRepo.create({
        supplier,
        purchased_by: { id: currentUserId } as UserEntity,
        total_amount: payload.total_amount,
        payment: paymentAmount,
        due: dueAmount,
        payment_info: payload.payment_info,
        files: fileNames.length > 0 ? fileNames : undefined,
        products: purchaseProducts,
      });

      await purchaseRepo.save(purchase);

      // Update supplier financials
      await supRepo.increment(
        { id: supplier.id },
        'total_purchased',
        payload.total_amount,
      );
      await supRepo.increment(
        { id: supplier.id },
        'give_amount',
        paymentAmount,
      );
      await supRepo.increment({ id: supplier.id }, 'due_amount', dueAmount);

      // Update product stock
      for (const item of payload.products) {
        await productRepo.increment({ id: item.product_id }, 'stock', item.qty);
        await productRepo.increment(
          { id: item.product_id },
          'purchased',
          item.qty,
        );
      }

      // Update user cash balance
      if (paymentAmount > 0) {
        const userRepo = qr.manager.getRepository(UserEntity);
        await userRepo.decrement(
          { id: currentUserId },
          'have_money',
          paymentAmount,
        );
      }

      // Update cash reports
      await this.reportService.updateCashReport(
        'purchase',
        payload.total_amount,
        qr.manager,
      );
      if (paymentAmount > 0) {
        await this.reportService.updateCashReport(
          'cash_out',
          paymentAmount,
          qr.manager,
        );
      }

      // Update stock reports per product
      for (const item of payload.products) {
        const product = await qr.manager
          .getRepository(ProductEntity)
          .findOne({ where: { id: item.product_id } });
        if (product) {
          await this.reportService.updateStockReport(
            item.product_id,
            0,
            item.qty,
            product.stock,
            qr.manager,
          );
        }
      }

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Purchase recorded successfully',
        data: purchase,
      };
    } catch (err) {
      await qr.rollbackTransaction();
      console.log(err);
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getAllPurchases({
    page = 1,
    limit = 10,
    supplier_id,
  }: GetAllPurchaseDto) {
    limit = clampLimit(limit);
    const skip = (page - 1) * limit;
    const purchaseRepo =
      await this.tenantDbService.getRepository(PurchaseEntity);

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

  async paySupplier(
    purchaseId: number,
    payload: PaySupplierDto,
    currentUserId: number,
  ) {
    const purchaseRepo =
      await this.tenantDbService.getRepository(PurchaseEntity);
    const purchase = await purchaseRepo.findOne({
      where: { id: purchaseId },
      relations: { supplier: true },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    if (payload.amount > purchase.due) {
      throw new BadRequestException('Amount exceeds remaining due');
    }

    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // Create payment record
      const pcRepo = qr.manager.getRepository(PurchaseCollectionEntity);
      const collection = pcRepo.create({
        purchase,
        sender: { id: currentUserId } as UserEntity,
        amount: payload.amount,
        notes: payload.notes,
      });
      await pcRepo.save(collection);

      // Update purchase
      const purchRepo = qr.manager.getRepository(PurchaseEntity);
      purchase.payment = Number(purchase.payment) + payload.amount;
      purchase.due = Number(purchase.due) - payload.amount;
      await purchRepo.save(purchase);

      // Update supplier
      const supRepo = qr.manager.getRepository(SupplierEntity);
      await supRepo.increment(
        { id: purchase.supplier.id },
        'give_amount',
        payload.amount,
      );
      await supRepo.decrement(
        { id: purchase.supplier.id },
        'due_amount',
        payload.amount,
      );

      // Update sender balance
      const userRepo = qr.manager.getRepository(UserEntity);
      await userRepo.decrement(
        { id: currentUserId },
        'have_money',
        payload.amount,
      );

      // Update cash reports
      await this.reportService.updateCashReport(
        'purchase',
        payload.amount,
        qr.manager,
      );
      await this.reportService.updateCashReport(
        'cash_out',
        payload.amount,
        qr.manager,
      );

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Supplier payment recorded successfully',
        data: { remaining_due: purchase.due },
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
