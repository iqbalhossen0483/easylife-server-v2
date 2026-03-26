import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { CustomerEntity } from 'src/entites/customer.entity';
import {
  CollectionEntity,
  OrderEntity,
  OrderProductEntity,
  OrderStatus,
} from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import { Target } from 'src/entites/target.entity';
import { CommissionStatus } from 'src/entites/target.entity';
import { UserEntity } from 'src/entites/user.entity';
import { API_Meta } from 'src/types/common';
import { Between, FindOptionsWhere } from 'typeorm';
import {
  CollectPaymentDto,
  CreateOrderDto,
  GetAllOrderDto,
  UpdateOrderDto,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async createOrder(payload: CreateOrderDto, currentUserId: number) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);

    const customer = await customerRepo.findOne({
      where: { id: payload.shop_id },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const deliveredByUser = await userRepo.findOne({
      where: { id: payload.delivered_by },
    });
    if (!deliveredByUser)
      throw new NotFoundException('Delivery user not found');

    const orderProducts = payload.products.map((p) => {
      const op = new OrderProductEntity();
      op.product_id = p.product_id;
      op.product_name = p.product_name;
      op.qty = p.qty;
      op.price = p.price;
      op.total = p.total;
      return op;
    });

    const order = orderRepo.create({
      shop: customer,
      created_by: { id: currentUserId } as UserEntity,
      delivered_by: deliveredByUser,
      total_sale: payload.total_sale,
      payment: payload.payment ?? 0,
      due: payload.due ?? payload.total_sale - (payload.payment ?? 0),
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
  }: GetAllOrderDto) {
    const skip = (page - 1) * limit;
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

    if (payload.delivered_by) {
      const userRepo = await this.tenantDbService.getRepository(UserEntity);
      const deliveryUser = await userRepo.findOne({
        where: { id: payload.delivered_by },
      });
      if (!deliveryUser) throw new NotFoundException('Delivery user not found');
      order.delivered_by = deliveryUser;
    }

    if (payload.total_sale !== undefined) order.total_sale = payload.total_sale;
    if (payload.payment !== undefined) order.payment = payload.payment;
    if (payload.due !== undefined) order.due = payload.due;

    // Replace products if provided
    if (payload.products) {
      const opRepo =
        await this.tenantDbService.getRepository(OrderProductEntity);
      await opRepo.delete({ order: { id: orderId } });

      const newProducts = payload.products.map((p) => {
        const op = new OrderProductEntity();
        op.product_id = p.product_id;
        op.product_name = p.product_name;
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

  async deliverOrder(orderId: number) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
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

    // Mark as delivered
    order.status = OrderStatus.DELIVERED;
    await orderRepo.save(order);

    // --- Side effects ---

    // 8.14 Update customer totals
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);
    await customerRepo.increment(
      { id: order.shop.id },
      'total_sale',
      order.total_sale,
    );
    await customerRepo.increment({ id: order.shop.id }, 'due_sale', order.due);
    await customerRepo.increment({ id: order.shop.id }, 'due', order.due);
    await customerRepo.update(
      { id: order.shop.id },
      { last_order: new Date() },
    );

    // 8.15 Update product stock
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);
    for (const item of order.products) {
      await productRepo.decrement({ id: item.product_id }, 'stock', item.qty);
      await productRepo.increment({ id: item.product_id }, 'sold', item.qty);
    }

    // 8.16 Update user stats
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    if (order.delivered_by) {
      await userRepo.increment(
        { id: order.delivered_by.id },
        'delivered_order',
        1,
      );
      await userRepo.increment(
        { id: order.delivered_by.id },
        'total_sale',
        order.total_sale,
      );
      await userRepo.increment(
        { id: order.delivered_by.id },
        'due_sale',
        order.due,
      );
      if (order.payment > 0) {
        await userRepo.increment(
          { id: order.delivered_by.id },
          'have_money',
          order.payment,
        );
      }
    }

    // 8.19 Update sales targets
    await this.updateSalesTargets(order);

    // 8.17 & 8.18 TODO: Update cash/stock reports when report entities are built

    return {
      success: true,
      message: 'Order delivered successfully',
    };
  }

  async collectPayment(
    orderId: number,
    payload: CollectPaymentDto,
    currentUserId: number,
  ) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
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
    const totalReceived = collectionAmount + discountAmount;

    if (totalReceived > order.due) {
      throw new BadRequestException('Amount exceeds remaining due');
    }

    // Create collection record
    const collectionRepo =
      await this.tenantDbService.getRepository(CollectionEntity);

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
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);
    await customerRepo.increment(
      { id: order.shop.id },
      'collection',
      collectionAmount,
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
      const userRepo = await this.tenantDbService.getRepository(UserEntity);
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

    // 8.20 Auto-create discount expense
    // TODO: Create expense record when expense module is built

    // 8.17 TODO: Update cash reports when report entities are built

    return {
      success: true,
      message: 'Payment collected successfully',
      data: {
        collection_id: collection.id,
        remaining_due: order.due,
      },
    };
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

  // --- Private helpers ---

  private async updateSalesTargets(order: OrderEntity) {
    const targetRepo = await this.tenantDbService.getRepository(Target);

    // Update delivery user's running target
    if (order.delivered_by) {
      const deliveryTarget = await targetRepo.findOne({
        where: {
          user: { id: order.delivered_by.id },
          status: CommissionStatus.RUNNING,
        },
      });
      if (deliveryTarget) {
        deliveryTarget.achived_amnt =
          Number(deliveryTarget.achived_amnt) + Number(order.total_sale);
        await targetRepo.save(deliveryTarget);
      }
    }

    // Update order creator's running target
    if (order.created_by && order.created_by.id !== order.delivered_by?.id) {
      const creatorTarget = await targetRepo.findOne({
        where: {
          user: { id: order.created_by.id },
          status: CommissionStatus.RUNNING,
        },
      });
      if (creatorTarget) {
        creatorTarget.achived_amnt =
          Number(creatorTarget.achived_amnt) + Number(order.total_sale);
        await targetRepo.save(creatorTarget);
      }
    }
  }
}
