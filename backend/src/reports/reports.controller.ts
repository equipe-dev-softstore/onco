import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export')
  export(@Query('year', ParseIntPipe) year: number, @Query('month', ParseIntPipe) month: number) {
    return this.reportsService.getExportData(year, month);
  }
}
