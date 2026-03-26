import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/decorators/Role.decorators';
import { Designation } from 'src/entites/user.entity';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { RoleGaurd } from 'src/guards/RoleGaurd';
import { ReportService } from './report.service';

@ApiTags('Dashboard & Reports')
@UseGuards(AuthGaurd, RoleGaurd)
@Role(Designation.ADMIN)
@Controller('dashboard')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('/')
  async getDashboard() {
    return this.reportService.getDashboard();
  }

  @Get('/cash-report')
  async getCashReport(
    @Query('method') method: 'date' | 'month' | 'year' = 'date',
    @Query('value') value?: string,
  ) {
    return this.reportService.getCashReport(method, value);
  }

  @Get('/notifications')
  async getUndeliveredOrders() {
    return this.reportService.getUndeliveredOrders();
  }

  @Get('/chart')
  async getChartData(@Query('days') days?: string) {
    return this.reportService.getChartData(days ? Number(days) : 30);
  }

  @Get('/piechart')
  async getPieChartData() {
    return this.reportService.getPieChartData();
  }

  @Get('/product-chart')
  async getProductChartData() {
    return this.reportService.getProductChartData();
  }
}
