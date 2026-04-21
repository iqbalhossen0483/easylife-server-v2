import { TenantDatabaseService } from '@/database/tenant-datasource.manager';
import {
  DailyCashReportEntity,
  DailyStockReportEntity,
  MonthlyCashReportEntity,
  MonthlyStockReportEntity,
  YearlyCashReportEntity,
  YearlyStockReportEntity,
} from '@/entites/report.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

type CashField =
  | 'total_sale'
  | 'due_sale'
  | 'collection'
  | 'expense'
  | 'purchase'
  | 'cash_in'
  | 'payment';

@Injectable()
export class ReportUpdateService {
  constructor(private readonly tenantDbService: TenantDatabaseService) {}

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

    // --- Daily ---
    const dailyRepo = mgr.getRepository(DailyCashReportEntity);
    let daily = await dailyRepo.findOne({
      where: { date: new Date(dateStr) },
    });

    if (!daily) {
      // Fetch last row to get closing as opening
      const dailyReport = await dailyRepo.find({
        order: { date: 'DESC' },
        take: 1,
      });
      const lastDaily = dailyReport[0];
      const opening = lastDaily ? Number(lastDaily.closing) : 0;

      daily = dailyRepo.create({
        date: new Date(dateStr),
        opening,
        closing: opening,
      });
      await dailyRepo.save(daily);
    }

    // Increment the field
    await dailyRepo.increment({ id: daily.id }, field, amount);

    // Recalculate closing
    const updatedDaily = await dailyRepo.findOne({ where: { id: daily.id } });
    if (updatedDaily) {
      updatedDaily.closing = this.calculateClosing(updatedDaily);
      await dailyRepo.save(updatedDaily);
    }

    // --- Monthly ---
    const monthlyRepo = mgr.getRepository(MonthlyCashReportEntity);
    let monthly = await monthlyRepo.findOne({ where: { month, year } });

    if (!monthly) {
      const monthlyReport = await monthlyRepo.find({
        order: { year: 'DESC', month: 'DESC' },
        take: 1,
      });
      const lastMonthly = monthlyReport[0];
      const opening = lastMonthly ? Number(lastMonthly.closing) : 0;

      monthly = monthlyRepo.create({ month, year, opening, closing: opening });
      await monthlyRepo.save(monthly);
    }

    await monthlyRepo.increment({ id: monthly.id }, field, amount);

    const updatedMonthly = await monthlyRepo.findOne({
      where: { id: monthly.id },
    });
    if (updatedMonthly) {
      updatedMonthly.closing = this.calculateClosing(updatedMonthly);
      await monthlyRepo.save(updatedMonthly);
    }

    // --- Yearly ---
    const yearlyRepo = mgr.getRepository(YearlyCashReportEntity);
    let yearly = await yearlyRepo.findOne({ where: { year } });

    if (!yearly) {
      const yearlyReport = await yearlyRepo.find({
        order: { year: 'DESC' },
        take: 1,
      });
      const lastYearly = yearlyReport[0];
      const opening = lastYearly ? Number(lastYearly.closing) : 0;

      yearly = yearlyRepo.create({ year, opening, closing: opening });
      await yearlyRepo.save(yearly);
    }

    await yearlyRepo.increment({ id: yearly.id }, field, amount);

    const updatedYearly = await yearlyRepo.findOne({
      where: { id: yearly.id },
    });
    if (updatedYearly) {
      updatedYearly.closing = this.calculateClosing(updatedYearly);
      await yearlyRepo.save(updatedYearly);
    }
  }

  /**
   * closing = opening + total_sale - due_sale + collection - expense - payment + cash_in
   */
  private calculateClosing(
    report:
      | DailyCashReportEntity
      | MonthlyCashReportEntity
      | YearlyCashReportEntity,
  ): number {
    return (
      Number(report.opening) +
      Number(report.total_sale) -
      Number(report.due_sale) +
      Number(report.collection) -
      Number(report.payment) -
      Number(report.expense) +
      Number('cash_in' in report ? report.cash_in : 0)
    );
  }

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

    // --- Daily ---
    const dailyRepo = mgr.getRepository(DailyStockReportEntity);
    let daily = await dailyRepo.findOne({
      where: { date: new Date(dateStr), product: { id: productId } },
    });

    if (!daily) {
      // Fetch last row for this product to get previous stock
      const lastDaily = await dailyRepo.findOne({
        where: { product: { id: productId } },
        order: { date: 'DESC' },
      });
      const previousStock = lastDaily
        ? lastDaily.remaining_stock
        : remainingStock + soldQty - purchasedQty;

      daily = dailyRepo.create({
        date: new Date(dateStr),
        product: { id: productId },
        previous_stock: previousStock,
        total_sold: 0,
        purchased: 0,
        remaining_stock: remainingStock,
      });
    }

    daily.total_sold = daily.total_sold + soldQty;
    daily.purchased = daily.purchased + purchasedQty;
    daily.remaining_stock = remainingStock;
    await dailyRepo.save(daily);

    // --- Monthly ---
    const monthlyRepo = mgr.getRepository(MonthlyStockReportEntity);
    let monthly = await monthlyRepo.findOne({
      where: { month, year, product: { id: productId } },
    });

    if (!monthly) {
      const lastMonthly = await monthlyRepo.findOne({
        where: { product: { id: productId } },
        order: { year: 'DESC', month: 'DESC' },
      });
      const previousStock = lastMonthly
        ? lastMonthly.remaining_stock
        : remainingStock + soldQty - purchasedQty;

      monthly = monthlyRepo.create({
        month,
        year,
        product: { id: productId },
        previous_stock: previousStock,
        total_sold: 0,
        purchased: 0,
        remaining_stock: remainingStock,
      });
    }

    monthly.total_sold = monthly.total_sold + soldQty;
    monthly.purchased = monthly.purchased + purchasedQty;
    monthly.remaining_stock = remainingStock;
    await monthlyRepo.save(monthly);

    // --- Yearly ---
    const yearlyRepo = mgr.getRepository(YearlyStockReportEntity);
    let yearly = await yearlyRepo.findOne({
      where: { year, product: { id: productId } },
    });

    if (!yearly) {
      const lastYearly = await yearlyRepo.findOne({
        where: { product: { id: productId } },
        order: { year: 'DESC' },
      });
      const previousStock = lastYearly
        ? lastYearly.remaining_stock
        : remainingStock + soldQty - purchasedQty;

      yearly = yearlyRepo.create({
        year,
        product: { id: productId },
        previous_stock: previousStock,
        total_sold: 0,
        purchased: 0,
        remaining_stock: remainingStock,
      });
    }

    yearly.total_sold = yearly.total_sold + soldQty;
    yearly.purchased = yearly.purchased + purchasedQty;
    yearly.remaining_stock = remainingStock;
    await yearlyRepo.save(yearly);
  }

  private async getManager(): Promise<EntityManager> {
    const qr = await this.tenantDbService.createQueryRunner();
    await qr.connect();
    return qr.manager;
  }
}
