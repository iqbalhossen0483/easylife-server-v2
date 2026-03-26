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
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1);

    const orderRepo = await this.tenantDbService.getRepository(OrderEntity);
    const customerRepo = await this.tenantDbService.getRepository(CustomerEntity);
    const userRepo = await this.tenantDbService.getRepository(UserEntity);
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);

    // Today's stats
    const todayOrders = await orderRepo.find({
      where: { created_at: Between(startOfDay, endOfDay) },
    });

    const todaySale = todayOrders.reduce((sum, o) => sum + Number(o.total_sale), 0);
    const todayCollection = todayOrders.reduce((sum, o) => sum + Number(o.payment), 0);
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
      const repo = await this.tenantDbService.getRepository(DailyCashReportEntity);
      const date = value ?? new Date().toISOString().split('T')[0];
      const report = await repo.findOne({ where: { date: new Date(date) } });
      return { success: true, message: 'Daily cash report', data: report };
    }

    if (method === 'month') {
      const repo = await this.tenantDbService.getRepository(MonthlyCashReportEntity);
      const now = new Date();
      const [y, m] = value ? value.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
      const report = await repo.findOne({ where: { year: y, month: m } });
      return { success: true, message: 'Monthly cash report', data: report };
    }

    const repo = await this.tenantDbService.getRepository(YearlyCashReportEntity);
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

    const orders = await orderRepo.find({
      where: {
        created_at: Between(startDate, new Date()),
        status: OrderStatus.DELIVERED,
      },
      select: { total_sale: true, created_at: true },
      order: { created_at: 'ASC' },
    });

    // Group by date
    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      grouped[date] = (grouped[date] ?? 0) + Number(order.total_sale);
    }

    const chart_data = Object.entries(grouped).map(([date, total]) => ({
      date,
      total_sale: total,
    }));

    return {
      success: true,
      message: 'Chart data fetched',
      data: chart_data,
    };
  }

  async getPieChartData() {
    const expenseRepo = await this.tenantDbService.getRepository(ExpenseEntity);
    const expenses = await expenseRepo.find({
      where: { status: ExpenseStatus.APPROVED },
      relations: { type: true },
      select: { amount: true, type: { id: true, name: true } },
    });

    // Group by type
    const grouped: Record<string, number> = {};
    for (const exp of expenses) {
      const name = exp.type?.name ?? 'Unknown';
      grouped[name] = (grouped[name] ?? 0) + Number(exp.amount);
    }

    const pie_data = Object.entries(grouped).map(([name, total]) => ({
      category: name,
      total,
    }));

    return {
      success: true,
      message: 'Pie chart data fetched',
      data: pie_data,
    };
  }

  async getProductChartData() {
    const productRepo = await this.tenantDbService.getRepository(ProductEntity);
    const products = await productRepo.find({
      select: { id: true, name: true, sold: true, stock: true, purchased: true },
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
