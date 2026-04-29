import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { CustomerEntity } from '@/entites/customer.entity';
import {
  ExpenseCategoryEntity,
  ExpenseEntity,
  ExpenseStatus,
} from '@/entites/expense.entity';
import {
  CollectionEntity,
  DiscountEntity,
  OrderEntity,
  OrderProductEntity,
  OrderStatus,
} from '@/entites/order.entity';
import { ProductEntity } from '@/entites/product.entity';
import { CommissionStatus, Target } from '@/entites/target.entity';
import { UserEntity } from '@/entites/user.entity';
import { ReportUpdateService } from '@/services/report-update.service';
import { API_Meta } from '@/types/common';
import { clampLimit } from '@/utils/file.util';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  MoreThan,
  QueryRunner,
} from 'typeorm';
import {
  CollectPaymentDto,
  CreateOrderDto,
  GetAllOrderDto,
  OrderProductItemDto,
  UpdateOrderDto,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly tenantDbService: TenantDatabaseService,
    private readonly reportService: ReportUpdateService,
  ) {}

  async orderValidation(
    products: OrderProductItemDto[],
    total_sale: number,
    payment?: number,
  ) {
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);

    // validate products and calculate total
    const productSet = new Set();
    let calculatedTotal = 0;
    for (const p of products) {
      // Validate products stock;
      const product = await productRepo.findOne({
        where: { id: p.product_id },
      });
      if (!product) throw new NotFoundException('Product not found');
      if (product.current_stock < p.qty) {
        throw new BadRequestException('Product has insufficient stock');
      }

      calculatedTotal += p.total;
      // If price is 0, it must be marked as free
      if (p.price === 0 && !p.is_free) {
        throw new BadRequestException(
          `Product #"${p.product_id}" price is 0 but not marked as free`,
        );
      }

      // validate product duplication in the list
      if (productSet.has(p.product_id)) {
        throw new BadRequestException(
          `Product #"${p.product_id}" is duplicated in the list`,
        );
      }
      productSet.add(p.product_id);

      // Validate each product's total = qty * price
      const expectedTotal = p.qty * p.price;
      if (Math.abs(expectedTotal - p.total) > 0.01) {
        throw new BadRequestException(
          `Product #"${p.product_id}" total (${p.total}) does not match qty(${p.qty}) × price(${p.price}) = ${expectedTotal}`,
        );
      }
    }

    // Validate products total matches total_sale
    if (Math.abs(calculatedTotal - total_sale) > 0.01) {
      throw new BadRequestException(
        `Products total (${calculatedTotal}) does not match total_sale (${total_sale})`,
      );
    }

    // Validate payment does not exceed total_sale
    if ((payment || 0) > total_sale) {
      throw new BadRequestException('Payment cannot exceed total sale amount');
    }
  }

  async createOrder(payload: CreateOrderDto, currentUserId: number) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const customer = await customerRepo.findOne({
      where: { id: payload.shop_id },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.orderValidation(
      payload.products,
      payload.total_sale,
      payload.payment,
    );

    const orderProducts = payload.products.map((p) => {
      const op = new OrderProductEntity();
      op.product_id = p.product_id;
      op.qty = p.qty;
      op.price = p.price;
      op.total = p.total;
      return op;
    });

    const order = orderRepo.create({
      shop: customer,
      created_by: { id: currentUserId } as UserEntity,
      total_sale: payload.total_sale,
      payment: payload.payment ?? 0,
      due: payload.total_sale - (payload.payment ?? 0),
      status: OrderStatus.UNDELIVERED,
      products: orderProducts,
    });

    await orderRepo.save(order);

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  async getAllOrders({
    page = 1,
    limit = 10,
    shop_id,
    user_id,
    status,
    start_date,
    end_date,
    has_due,
  }: GetAllOrderDto) {
    const take = clampLimit(limit);
    const skip = (page - 1) * take;
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);

    const query: FindOptionsWhere<OrderEntity> = {};

    if (shop_id) query.shop = { id: shop_id };
    if (user_id) query.delivered_by = { id: user_id };
    if (status) query.status = status;
    if (start_date && end_date) {
      query.created_at = Between(
        new Date(start_date),
        new Date(end_date + 'T23:59:59'),
      );
    }
    if (has_due) {
      query.due = MoreThan(0);
    }

    const [orders, total] = await orderRepo.findAndCount({
      where: query,
      relations: {
        shop: true,
        created_by: true,
        delivered_by: true,
        products: true,
      },
      select: {
        shop: { id: true, shop_name: true, phone: true },
        created_by: { id: true, name: true },
        delivered_by: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take,
      skip,
    });

    const meta: API_Meta = {
      total,
      limit: take,
      currentPage: page,
      totalPages: Math.ceil(total / take),
    };

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
      meta,
    };
  }

  async getSingleOrder(orderId: number) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);

    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: {
        shop: true,
        created_by: true,
        delivered_by: true,
        products: true,
        collections: { receiver: true },
      },
      select: {
        shop: { id: true, shop_name: true, phone: true, address: true },
        created_by: { id: true, name: true },
        delivered_by: { id: true, name: true },
        collections: {
          id: true,
          amount: true,
          discount: true,
          notes: true,
          created_at: true,
          receiver: { id: true, name: true },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return {
      success: true,
      message: 'Order fetched successfully',
      data: order,
    };
  }

  async updateOrder(orderId: number, payload: UpdateOrderDto) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: { products: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot edit a delivered order');
    }

    const total_sale = payload.total_sale ?? order.total_sale;
    const payment = payload.payment ?? order.payment;
    const products =
      payload.products ??
      order.products.map((p) => ({
        product_id: p.product_id,
        qty: p.qty,
        price: p.price,
        total: p.total,
        is_free: p.is_free,
      }));
    const due = total_sale - payment;

    await this.orderValidation(products, total_sale, payment);

    order.total_sale = total_sale;
    order.payment = payment;
    order.due = due;

    // Replace products if provided
    if (payload.products) {
      const opRepo =
        await this.tenantDbService.getRepository(OrderProductEntity);
      await opRepo.delete({ order: { id: orderId } });

      const newProducts = payload.products.map((p) => {
        const op = new OrderProductEntity();
        op.product_id = p.product_id;
        op.qty = p.qty;
        op.price = p.price;
        op.total = p.total;
        op.order = order;
        return op;
      });
      await opRepo.save(newProducts);
    }

    await orderRepo.save(order);

    return {
      success: true,
      message: 'Order updated successfully',
    };
  }

  async deliverOrder(
    orderId: number,
    currentUserId: number,
    cashReceived: number,
    discount: number,
    notes: string | undefined,
  ) {
    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const totalReceived = cashReceived + discount;

      const orderRepo = qr.manager.getRepository(OrderEntity);
      const order = await orderRepo.findOne({
        where: { id: orderId },
        relations: {
          shop: true,
          delivered_by: true,
          created_by: true,
          products: true,
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (order.status === OrderStatus.DELIVERED) {
        throw new BadRequestException('Order already delivered');
      }

      if (Number(order.due) < totalReceived) {
        throw new BadRequestException(
          `Total received (${totalReceived}) exceeds remaining due (${order.due})`,
        );
      }

      if (discount && Number(order.due) > totalReceived) {
        throw new BadRequestException(
          `Can only apply discount to the amount being collected in this transaction`,
        );
      }

      if (discount && discount > Number(order.total_sale) * 0.01) {
        throw new BadRequestException(
          `Discount (${discount}) exceeds maximum 1% of total sale (${(Number(order.total_sale) * 0.01).toFixed(2)})`,
        );
      }

      const advancePayment = Number(order.payment);

      // Mark as delivered
      order.status = OrderStatus.DELIVERED;
      order.payment = advancePayment + cashReceived;
      order.due = Number(order.due) - totalReceived;
      order.delivered_at = new Date();
      order.delivered_by = { id: currentUserId } as UserEntity;
      order.discount = discount;

      await orderRepo.save(order);

      // Update customer totals
      const customerRepo = qr.manager.getRepository(CustomerEntity);
      await customerRepo.increment(
        { id: order.shop.id },
        'total_sale',
        order.total_sale,
      );
      await customerRepo.increment(
        { id: order.shop.id },
        'due_sale',
        order.due,
      );
      await customerRepo.increment({ id: order.shop.id }, 'due', order.due);
      await customerRepo.update(
        { id: order.shop.id },
        { last_order: new Date() },
      );

      // Update product stock (batch via query builder)
      const productRepo = qr.manager.getRepository(ProductEntity);
      for (const item of order.products) {
        await productRepo.decrement(
          { id: item.product_id },
          'current_stock',
          item.qty,
        );
        await productRepo.increment({ id: item.product_id }, 'sold', item.qty);
      }

      // Update user stats
      const userRepo = qr.manager.getRepository(UserEntity);
      if (order.delivered_by) {
        await userRepo.increment(
          { id: order.delivered_by.id },
          'delivered_order',
          1,
        );
        await userRepo.increment(
          { id: order.created_by.id },
          'total_sale',
          order.total_sale,
        );
        await userRepo.increment(
          { id: order.created_by.id },
          'due_sale',
          order.due,
        );
        if (advancePayment > 0) {
          await userRepo.increment(
            { id: order.created_by.id },
            'have_money',
            advancePayment,
          );
        }
        if (cashReceived > 0) {
          await userRepo.increment(
            { id: order.delivered_by.id },
            'have_money',
            cashReceived,
          );
        }
      }

      // Update sales targets
      await this.updateSalesTargets(order, discount, qr.manager);

      // Update cash reports
      await this.reportService.updateCashReport(
        'total_sale',
        Number(order.total_sale),
        qr.manager,
      );
      await this.reportService.updateCashReport(
        'due_sale',
        Number(order.due),
        qr.manager,
      );

      // Auto-create discount expense if applicable
      if (discount > 0) {
        await this.updateDiscountToExpense(
          qr,
          orderId,
          discount,
          currentUserId,
          order,
          notes,
        );
      }

      // Update stock reports per product
      for (const item of order.products) {
        const product = await productRepo.findOne({
          where: { id: item.product_id },
        });
        if (product) {
          await this.reportService.updateStockReport(
            item.product_id,
            item.qty,
            0,
            product.current_stock,
            qr.manager,
          );
        }
      }

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Order delivered successfully',
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async collectPayment(
    orderId: number,
    payload: CollectPaymentDto,
    currentUserId: number,
  ) {
    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const orderRepo = qr.manager.getRepository(OrderEntity);
      const order = await orderRepo.findOne({
        where: { id: orderId },
        relations: { shop: true, delivered_by: true },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (order.status !== OrderStatus.DELIVERED) {
        throw new BadRequestException(
          'Order must be delivered before collecting payment',
        );
      }

      const collectionAmount = payload.amount;
      const discountAmount = payload.discount ?? 0;
      const orderDue = Number(order.due);
      const totalReceived = collectionAmount + discountAmount;

      if (collectionAmount > orderDue) {
        throw new BadRequestException(
          `Collection amount (${collectionAmount}) exceeds remaining due (${orderDue})`,
        );
      }

      if (totalReceived > orderDue) {
        throw new BadRequestException(
          `Total received (${totalReceived}) exceeds remaining due (${orderDue})`,
        );
      }

      // Discount cannot exceed 1% of total sale
      if (discountAmount > 0) {
        if (orderDue < 0) {
          throw new BadRequestException(
            'Cannot apply discount to an order with no due amount',
          );
        } else if (orderDue > collectionAmount + discountAmount) {
          throw new BadRequestException(
            'Discount can only be applied to the amount being collected in this transaction',
          );
        }
        const maxDiscount = order.total_sale * 0.01;
        if (discountAmount > maxDiscount) {
          throw new BadRequestException(
            `Discount (${discountAmount}) exceeds maximum 1% of total sale (${maxDiscount.toFixed(2)})`,
          );
        }
      }

      // Create collection record
      const collectionRepo = qr.manager.getRepository(CollectionEntity);
      const collection = collectionRepo.create({
        order,
        receiver: { id: currentUserId } as UserEntity,
        amount: collectionAmount,
        discount: discountAmount,
        notes: payload.notes,
      });
      await collectionRepo.save(collection);

      // Update order
      order.payment = Number(order.payment) + collectionAmount;
      order.discount = Number(order.discount) + discountAmount;
      order.due = Number(order.due) - totalReceived;
      await orderRepo.save(order);

      // Update customer
      const customerRepo = qr.manager.getRepository(CustomerEntity);
      await customerRepo.increment(
        { id: order.shop.id },
        'collection',
        collectionAmount + discountAmount,
      );
      if (discountAmount > 0) {
        await customerRepo.increment(
          { id: order.shop.id },
          'discount',
          discountAmount,
        );
      }
      await customerRepo.decrement({ id: order.shop.id }, 'due', totalReceived);

      // Update receiver user balance
      if (collectionAmount > 0) {
        const userRepo = qr.manager.getRepository(UserEntity);
        await userRepo.increment(
          { id: currentUserId },
          'have_money',
          collectionAmount,
        );
        await userRepo.increment(
          { id: currentUserId },
          'due_collection',
          collectionAmount,
        );
      }

      // Update cash reports
      await this.reportService.updateCashReport(
        'collection',
        collectionAmount,
        qr.manager,
      );

      // Auto-create discount expense if applicable
      if (discountAmount > 0) {
        await this.updateDiscountToExpense(
          qr,
          orderId,
          discountAmount,
          currentUserId,
          order,
          payload.notes,
        );
      }

      await qr.commitTransaction();

      return {
        success: true,
        message: 'Payment collected successfully',
        data: {
          collection_id: collection.id,
          remaining_due: order.due,
        },
      };
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async deleteOrder(orderId: number) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const order = await orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot delete a delivered order');
    }

    const result = await orderRepo.softDelete({ id: orderId });
    if (result.affected === 0) {
      throw new NotImplementedException('Something went wrong');
    }

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }

  async getMyCollections(currentUserId: number) {
    const collectionRepo =
      await this.tenantDbService.getRepository(CollectionEntity);

    const collections = await collectionRepo.find({
      where: { receiver: { id: currentUserId } },
      relations: { order: { shop: true } },
      select: {
        id: true,
        amount: true,
        discount: true,
        notes: true,
        created_at: true,
        order: {
          id: true,
          total_sale: true,
          due: true,
          shop: { id: true, shop_name: true },
        },
      },
      order: { created_at: 'DESC' },
      take: 50,
    });

    return {
      success: true,
      message: 'Collections fetched successfully',
      data: collections,
    };
  }

  // --- Private helpers ---

  private async updateSalesTargets(
    order: OrderEntity,
    discount: number,
    manager: EntityManager,
  ) {
    const targetRepo = manager.getRepository(Target);
    const totalSale = Number(order.total_sale) - discount;

    // Apply customer commission percentage to determine achievable amount
    // e.g. commission=60 means 60% of total_sale counts toward target
    const customerCommission = Number(order.shop?.commission ?? 100);
    const achievableAmount = Math.round((totalSale * customerCommission) / 100);

    if (achievableAmount <= 0) return;

    const target = await targetRepo.findOne({
      where: {
        user: { id: order.created_by.id },
        status: CommissionStatus.RUNNING,
      },
    });
    if (target) {
      target.achived_amnt = Number(target.achived_amnt) + achievableAmount;
      await targetRepo.save(target);
    }
  }

  private async updateDiscountToExpense(
    qr: QueryRunner,
    orderId: number,
    discountAmount: number,
    currentUserId: number,
    order: OrderEntity,
    notes: string | undefined,
  ) {
    await this.reportService.updateCashReport(
      'expense',
      discountAmount,
      qr.manager,
    );
    const expenseCategoryRepo = qr.manager.getRepository<ExpenseCategoryEntity>(
      ExpenseCategoryEntity,
    );
    let discountCategory = await expenseCategoryRepo.findOne({
      where: { name: 'Discount' },
    });
    if (!discountCategory) {
      discountCategory = expenseCategoryRepo.create({
        name: 'Discount',
        description: 'Auto-created category for order discounts',
        created_by: { id: currentUserId } as UserEntity,
      });
      await expenseCategoryRepo.save(discountCategory);
    }
    const expenseRepo = qr.manager.getRepository<ExpenseEntity>(ExpenseEntity);
    const expense = expenseRepo.create({
      type: discountCategory,
      amount: discountAmount,
      status: ExpenseStatus.APPROVED,
      created_by: { id: currentUserId } as UserEntity,
      approved_by: { id: currentUserId } as UserEntity,
      approved_at: new Date(),
      note: `Auto-created discount from order #${orderId}`,
    });
    await expenseRepo.save(expense);

    // store discount amount in discount table
    const discountRepo = qr.manager.getRepository(DiscountEntity);
    const discount = discountRepo.create({
      order,
      amount: discountAmount,
      applied_by: { id: currentUserId },
      reason: notes,
    });
    await discountRepo.save(discount);
  }
}
