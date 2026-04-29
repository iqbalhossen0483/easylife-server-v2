import { CurrentUser } from '@/decorators/currentUser';
import { Role } from '@/decorators/Role.decorators';
import { Designation } from '@/entites/user.entity';
import { AuthGaurd } from '@/guards/AuthGaurd';
import { RoleGaurd } from '@/guards/RoleGaurd';
import type { JWT_Payload } from '@/types/common';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@ApiTags('Dashboard & Reports')
@UseGuards(AuthGaurd, RoleGaurd)
@Controller('dashboard')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Role(Designation.ADMIN)
  @Get('/')
  async getDashboard() {
    return this.reportService.getDashboard();
  }

  @Role(Designation.ADMIN)
  @Get('/cash-report')
  async getCashReport(
    @Query('method') method: 'date' | 'month' | 'year' = 'date',
    @Query('value') value?: string,
    @CurrentUser() user?: JWT_Payload,
  ) {
    return this.reportService.getCashReport(method, value, user?.designation);
  }

  @Role(Designation.ADMIN)
  @Get('/notifications')
  async getUndeliveredOrders() {
    return this.reportService.getUndeliveredOrders();
  }

  @Role(Designation.ADMIN)
  @Get('/chart')
  async getChartData(
    @Query('days') days?: string,
    @CurrentUser() user?: JWT_Payload,
  ) {
    const maxDays = user?.designation === Designation.ADMIN ? 60 : undefined;
    const requestedDays = days ? Number(days) : 30;
    return this.reportService.getChartData(
      maxDays ? Math.min(requestedDays, maxDays) : requestedDays,
    );
  }

  @Role(Designation.ADMIN)
  @Get('/piechart')
  async getPieChartData(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
  ) {
    return this.reportService.getPieChartData(start_date, end_date);
  }

  @Role(Designation.ADMIN)
  @Get('/product-chart')
  async getProductChartData() {
    return this.reportService.getProductChartData();
  }

  // Stock reports — super_admin + store_manager
  @Role(Designation.STORE_MANAGER)
  @Get('/stock-report')
  async getStockReport(
    @Query('date') date?: string,
    @Query('product_id') product_id?: number,
  ) {
    return this.reportService.getStockReport(date, product_id);
  }

  // User sales activity — super_admin, admin, store_manager
  @Role(Designation.ADMIN, Designation.STORE_MANAGER)
  @Get('/user-sales')
  async getUserSales(
    @Query('user_id') user_id: string,
    @Query('date') date?: string,
  ) {
    return this.reportService.getUserSalesActivity(Number(user_id), date);
  }

  @Role(Designation.ADMIN)
  @Get('/transactions')
  async getTransactionHistory() {
    return this.reportService.getTransactionHistory();
  }
}
