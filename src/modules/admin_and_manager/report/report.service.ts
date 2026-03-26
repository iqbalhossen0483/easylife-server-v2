import { Injectable } from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import { CustomerEntity } from 'src/entites/customer.entity';
import { ExpenseEntity, ExpenseStatus } from 'src/entites/expense.entity';
import { OrderEntity, OrderStatus } from 'src/entites/order.entity';
import { ProductEntity } from 'src/entites/product.entity';
import {
  DailyCashReportEntity,
  MonthlyCashReportEntity,
  YearlyCashReportEntity,
} from 'src/entites/report.entity';
import { UserEntity } from 'src/entites/user.entity';
import { Between } from 'typeorm';

@Injectable()
export class ReportService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  async getDashboard() {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);

    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const customerRepo =
      await this.tenantDbService.getRepository(CustomerEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);

    // Today's stats
    const todayOrders = await orderRepo.find({
      where: { created_at: Between(startOfDay, endOfDay) },
    });

    const todaySale = todayOrders.reduce(
      (sum, o) => sum + Number(o.total_sale),
      0,
    );
    const todayCollection = todayOrders.reduce(
      (sum, o) => sum + Number(o.payment),
      0,
    );
    const todayDue = todayOrders.reduce((sum, o) => sum + Number(o.due), 0);

    const undeliveredCount = await orderRepo.count({
      where: { status: OrderStatus.UNDELIVERED },
    });

    const totalCustomers = await customerRepo.count();
    const totalUsers = await userRepo.count();
    const totalProducts = await productRepo.count();

    return {
      success: true,
      message: 'Dashboard data fetched',
      data: {
        today: {
          total_sale: todaySale,
          collection: todayCollection,
          due: todayDue,
          orders: todayOrders.length,
        },
        undelivered_orders: undeliveredCount,
        total_customers: totalCustomers,
        total_users: totalUsers,
        total_products: totalProducts,
      },
    };
  }

  async getCashReport(method: 'date' | 'month' | 'year', value?: string) {
    if (method === 'date') {
      const repo = await this.tenantDbService.getRepository(
        DailyCashReportEntity,
      );
      const date = value ?? new Date().toISOString().split('T')[0];
      const report = await repo.findOne({ where: { date: new Date(date) } });
      return { success: true, message: 'Daily cash report', data: report };
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
      return { success: true, message: 'Monthly cash report', data: report };
    }

    const repo = await this.tenantDbService.getRepository(
      YearlyCashReportEntity,
    );
    const year = value ? Number(value) : new Date().getFullYear();
    const report = await repo.findOne({ where: { year } });
    return { success: true, message: 'Yearly cash report', data: report };
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

    // Use database GROUP BY instead of in-memory grouping
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

    // Use database GROUP BY with optional date range filter
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
        stock: true,
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
}
