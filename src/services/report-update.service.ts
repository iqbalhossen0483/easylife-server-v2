import { Injectable } from '@nestjs/common';
import { TenantDatabaseService } from 'src/database/tenant-datasource.manager';
import {
  DailyCashReportEntity,
  DailyStockReportEntity,
  MonthlyCashReportEntity,
  MonthlyStockReportEntity,
  YearlyCashReportEntity,
  YearlyStockReportEntity,
} from 'src/entites/report.entity';
import { EntityManager } from 'typeorm';

type CashField =
  | 'total_sale'
  | 'due_sale'
  | 'collection'
  | 'expense'
  | 'purchase'
  | 'cash_in'
  | 'cash_out';

@Injectable()
export class ReportUpdateService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

  /**
   * Update daily, monthly, yearly cash reports atomically.
   * Pass an EntityManager from a QueryRunner if inside a transaction.
   */
  async updateCashReport(
    field: CashField,
    amount: number,
    manager?: EntityManager,
  ) {
    const mgr = manager ?? (await this.getManager());
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Daily
    const dailyRepo = mgr.getRepository(DailyCashReportEntity);
    let daily = await dailyRepo.findOne({
      where: { date: new Date(dateStr) },
    });
    if (!daily) {
      daily = dailyRepo.create({ date: new Date(dateStr) });
      await dailyRepo.save(daily);
    }
    await dailyRepo.increment({ id: daily.id }, field, amount);

    // Update closing = opening + totalSale - dueSale + collection - expense - purchase
    const updatedDaily = await dailyRepo.findOne({
      where: { id: daily.id },
    });
    if (updatedDaily) {
      updatedDaily.closing =
        Number(updatedDaily.opening) +
        Number(updatedDaily.total_sale) -
        Number(updatedDaily.due_sale) +
        Number(updatedDaily.collection) -
        Number(updatedDaily.expense) -
        Number(updatedDaily.purchase);
      await dailyRepo.save(updatedDaily);
    }

    // Monthly
    const monthlyRepo = mgr.getRepository(MonthlyCashReportEntity);
    let monthly = await monthlyRepo.findOne({ where: { month, year } });
    if (!monthly) {
      monthly = monthlyRepo.create({ month, year });
      await monthlyRepo.save(monthly);
    }
    await monthlyRepo.increment({ id: monthly.id }, field, amount);

    // Yearly
    const yearlyRepo = mgr.getRepository(YearlyCashReportEntity);
    let yearly = await yearlyRepo.findOne({ where: { year } });
    if (!yearly) {
      yearly = yearlyRepo.create({ year });
      await yearlyRepo.save(yearly);
    }
    await yearlyRepo.increment({ id: yearly.id }, field, amount);
  }

  /**
   * Update daily, monthly, yearly stock reports.
   */
  async updateStockReport(
    productId: number,
    soldQty: number,
    purchasedQty: number,
    remainingStock: number,
    manager?: EntityManager,
  ) {
    const mgr = manager ?? (await this.getManager());
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Daily
    const dailyRepo = mgr.getRepository(DailyStockReportEntity);
    let daily = await dailyRepo.findOne({
      where: { date: new Date(dateStr), product_id: productId },
    });
    if (!daily) {
      daily = dailyRepo.create({
        date: new Date(dateStr),
        product_id: productId,
        previous_stock: remainingStock + soldQty - purchasedQty,
      });
    }
    daily.total_sold = (daily.total_sold ?? 0) + soldQty;
    daily.purchased = (daily.purchased ?? 0) + purchasedQty;
    daily.remaining_stock = remainingStock;
    await dailyRepo.save(daily);

    // Monthly
    const monthlyRepo = mgr.getRepository(MonthlyStockReportEntity);
    let monthly = await monthlyRepo.findOne({
      where: { month, year, product_id: productId },
    });
    if (!monthly) {
      monthly = monthlyRepo.create({
        month,
        year,
        product_id: productId,
        previous_stock: remainingStock + soldQty - purchasedQty,
      });
    }
    monthly.total_sold = (monthly.total_sold ?? 0) + soldQty;
    monthly.purchased = (monthly.purchased ?? 0) + purchasedQty;
    monthly.remaining_stock = remainingStock;
    await monthlyRepo.save(monthly);

    // Yearly
    const yearlyRepo = mgr.getRepository(YearlyStockReportEntity);
    let yearly = await yearlyRepo.findOne({
      where: { year, product_id: productId },
    });
    if (!yearly) {
      yearly = yearlyRepo.create({
        year,
        product_id: productId,
        previous_stock: remainingStock + soldQty - purchasedQty,
      });
    }
    yearly.total_sold = (yearly.total_sold ?? 0) + soldQty;
    yearly.purchased = (yearly.purchased ?? 0) + purchasedQty;
    yearly.remaining_stock = remainingStock;
    await yearlyRepo.save(yearly);
  }

  private async getManager(): Promise<EntityManager> {
    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    return qr.manager;
  }
}
