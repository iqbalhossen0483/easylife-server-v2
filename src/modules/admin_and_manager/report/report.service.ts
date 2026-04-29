import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import { CustomerEntity } from '@/entites/customer.entity';
import { ExpenseEntity, ExpenseStatus } from '@/entites/expense.entity';
import { OrderEntity, OrderStatus } from '@/entites/order.entity';
import { ProductEntity } from '@/entites/product.entity';
import {
  DailyCashReportEntity,
  DailyStockReportEntity,
  MonthlyCashReportEntity,
  YearlyCashReportEntity,
} from '@/entites/report.entity';
import { TransactionEntity } from '@/entites/transaction.entity';
import { Designation, UserEntity } from '@/entites/user.entity';
import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { Between, FindOptionsWhere } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async getDashboard() {
    const today = new Date();
    const startOfDay = moment(today).startOf('day').toDate();
    const endOfDay = moment(today).endOf('day').toDate();

    const [orderRepo, customerRepo, userRepo, productRepo] = await Promise.all([
      this.tenantDbService.getRepository(OrderEntity),
      this.tenantDbService.getRepository(CustomerEntity),
      this.tenantDbService.getRepository(UserEntity),
      this.tenantDbService.getRepository(ProductEntity),
    ]);

    const todayOrders = await orderRepo.find({
      where: {
        delivered_at: Between(startOfDay, endOfDay),
        status: OrderStatus.DELIVERED,
      },
    });

    let todayTotalSale = 0;
    let todayCashSale = 0;
    let todayDueSale = 0;

    for (const o of todayOrders) {
      todayTotalSale += Number(o.total_sale);
      todayCashSale += Number(o.payment);
      todayDueSale += Number(o.due);
    }

    // total reports
    const [
      undeliveredCount,
      totalOrders,
      totalDelivered,
      totalPending,
      totalCustomers,
      totalUsers,
      totalProducts,
    ] = await Promise.all([
      orderRepo.count({
        where: { status: OrderStatus.UNDELIVERED },
      }),
      orderRepo.count(),
      orderRepo.count({
        where: { status: OrderStatus.DELIVERED },
      }),
      orderRepo.count({
        where: { status: OrderStatus.PENDING },
      }),
      customerRepo.count(),
      userRepo.count(),
      productRepo.count(),
    ]);

    return {
      success: true,
      message: 'Dashboard data fetched',
      data: {
        today: {
          total_sale: todayTotalSale,
          cash_sale: todayCashSale,
          due_sale: todayDueSale,
          total_orders: todayOrders.length,
        },
        undelivered_orders: undeliveredCount,
        total_orders: totalOrders,
        total_delivered: totalDelivered,
        total_pending: totalPending,
        total_customers: totalCustomers,
        total_users: totalUsers,
        total_products: totalProducts,
      },
    };
  }

  async getCashReport(
    method: 'date' | 'month' | 'year',
    value?: string,
    designation?: Designation,
  ) {
    // Admin can get all data but rest are restricted to last 2 months for daily
    if (designation !== Designation.ADMIN && method === 'date') {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const requestedDate = new Date(
        value ?? new Date().toISOString().split('T')[0],
      );
      if (requestedDate < twoMonthsAgo) {
        return {
          success: false,
          message: 'You cannot view reports older than 2 months',
          data: null,
        };
      }
    }

    if (method === 'date') {
      const repo = await this.tenantDbService.getRepository(
        DailyCashReportEntity,
      );
      const date = value ?? new Date().toISOString().split('T')[0];
      const report = await repo.findOne({ where: { date: new Date(date) } });
      const dailyReportTemplate = repo.create({
        id: 0,
        date: new Date(date),
        opening: 0,
        total_sale: 0,
        due_sale: 0,
        collection: 0,
        cash_in: 0,
        expense: 0,
        payment: 0,
        market_due: 0,
        purchase: 0,
        closing: 0,
      });

      return {
        success: true,
        message: 'Daily cash report',
        data: report ?? dailyReportTemplate,
      };
    }

    if (method === 'month') {
      const repo = await this.tenantDbService.getRepository(
        MonthlyCashReportEntity,
      );
      const now = new Date();
      const [y, m] = value
        ? value.split('-').map(Number)
        : [now.getFullYear(), now.getMonth() + 1];
      const report = await repo.findOne({ where: { year: y, month: m } });
      const monthlyReportTemplate = repo.create({
        id: 0,
        year: y,
        month: m,
        opening: 0,
        total_sale: 0,
        due_sale: 0,
        collection: 0,
        cash_in: 0,
        expense: 0,
        payment: 0,
        market_due: 0,
        purchase: 0,
        closing: 0,
      });
      return {
        success: true,
        message: 'Monthly cash report',
        data: report ?? monthlyReportTemplate,
      };
    }

    const repo = await this.tenantDbService.getRepository(
      YearlyCashReportEntity,
    );
    const year = value ? Number(value) : new Date().getFullYear();
    const report = await repo.findOne({ where: { year } });
    const yearlyReportTemplate = repo.create({
      id: 0,
      year,
      opening: 0,
      total_sale: 0,
      due_sale: 0,
      collection: 0,
      cash_in: 0,
      expense: 0,
      payment: 0,
      market_due: 0,
      purchase: 0,
      closing: 0,
    });
    return {
      success: true,
      message: 'Yearly cash report',
      data: report ?? yearlyReportTemplate,
    };
  }

  async getUndeliveredOrders() {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const orders = await orderRepo.find({
      where: { status: OrderStatus.UNDELIVERED },
      relations: { shop: true, delivered_by: true },
      select: {
        shop: { id: true, shop_name: true, phone: true },
        delivered_by: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      message: 'Undelivered orders fetched',
      data: orders,
    };
  }

  async getChartData(days: number = 30) {
    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const chart_data = await orderRepo
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(order.total_sale)', 'total_sale')
      .where('order.created_at BETWEEN :start AND :end', {
        start: startDate,
        end: new Date(),
      })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy("TO_CHAR(order.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      success: true,
      message: 'Chart data fetched',
      data: chart_data.map((row: { date: string; total_sale: string }) => ({
        date: row.date,
        total_sale: Number(row.total_sale),
      })),
    };
  }

  async getPieChartData(start_date?: string, end_date?: string) {
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);

    const qb = expenseRepo
      .createQueryBuilder('expense')
      .innerJoin('expense.type', 'type')
      .select('type.name', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .where('expense.status = :status', { status: ExpenseStatus.APPROVED });

    if (start_date && end_date) {
      qb.andWhere('expense.created_at BETWEEN :start AND :end', {
        start: new Date(start_date),
        end: new Date(end_date + 'T23:59:59'),
      });
    }

    const pie_data = await qb.groupBy('type.name').getRawMany();

    return {
      success: true,
      message: 'Pie chart data fetched',
      data: pie_data.map((row: { category: string; total: string }) => ({
        category: row.category,
        total: Number(row.total),
      })),
    };
  }

  async getProductChartData() {
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);
    const products = await productRepo.find({
      select: {
        id: true,
        name: true,
        sold: true,
        current_stock: true,
        purchased: true,
      },
      order: { sold: 'DESC' },
      take: 20,
    });

    return {
      success: true,
      message: 'Product chart data fetched',
      data: products,
    };
  }

  async getStockReport(date?: string, productId?: number) {
    const repo = await this.tenantDbService.getRepository(
      DailyStockReportEntity,
    );
    const targetDate = date ?? new Date().toISOString().split('T')[0];

    const where: FindOptionsWhere<DailyStockReportEntity> = {};
    if (targetDate) where.date = new Date(targetDate);
    if (productId) where.product = { id: productId };

    const reports = await repo.find({ where });

    return {
      success: true,
      message: 'Stock report fetched',
      data: reports,
    };
  }

  async getUserSalesActivity(userId: number, date?: string) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate);
    const endOfDay = new Date(targetDate + 'T23:59:59');

    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);

    const orders = await orderRepo.find({
      where: {
        delivered_by: { id: userId },
        status: OrderStatus.DELIVERED,
        created_at: Between(startOfDay, endOfDay),
      },
      relations: { products: true, shop: true },
      select: {
        id: true,
        total_sale: true,
        payment: true,
        due: true,
        created_at: true,
        shop: { id: true, shop_name: true },
      },
    });

    // Aggregate product-wise sales
    const productSales: Record<
      string,
      {
        product_id: number;
        total_qty: number;
        total_amount: number;
      }
    > = {};

    for (const order of orders) {
      for (const item of order.products) {
        const key = String(item.product_id);
        if (!productSales[key]) {
          productSales[key] = {
            product_id: item.product_id,
            total_qty: 0,
            total_amount: 0,
          };
        }
        productSales[key].total_qty += item.qty;
        productSales[key].total_amount += Number(item.total);
      }
    }

    return {
      success: true,
      message: 'User sales activity fetched',
      data: {
        user_id: userId,
        date: targetDate,
        total_orders: orders.length,
        total_sale: orders.reduce((s, o) => s + Number(o.total_sale), 0),
        orders,
        product_summary: Object.values(productSales),
      },
    };
  }

  async getTransactionHistory() {
    const txRepo = await this.tenantDbService.getRepository(TransactionEntity);

    const transactions = await txRepo.find({
      relations: { from_user: true, to_user: true },
      select: {
        from_user: { id: true, name: true },
        to_user: { id: true, name: true },
      },
      order: { created_at: 'DESC' },
      take: 50,
    });

    return {
      success: true,
      message: 'Transaction history fetched',
      data: transactions,
    };
  }
}
