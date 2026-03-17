import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getExportData(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        data_atendimento: {
          gte: start,
          lte: end,
        }
      },
      orderBy: { data_atendimento: 'desc' }
    });
  }
}
