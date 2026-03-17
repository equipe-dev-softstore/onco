import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats(@Query('year', ParseIntPipe) year: number, @Query('month', ParseIntPipe) month: number) {
    return this.dashboardService.getStats(year, month);
  }

  @Get('charts')
  getCharts(@Query('year', ParseIntPipe) year: number, @Query('month', ParseIntPipe) month: number) {
    return this.dashboardService.getCharts(year, month);
  }
}
