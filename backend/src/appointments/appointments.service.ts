import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/appointment-query.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, userId: string) {
    return this.prisma.appointment.create({
      data: {
        ...dto,
        created_by: userId,
      }
    });
  }

  async findAll(query: AppointmentQueryDto) {
    const { nome_paciente, start_date, end_date, tipo_tratamento, status_comparecimento, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (nome_paciente) {
      where.nome_paciente = { contains: nome_paciente, mode: 'insensitive' };
    }
    if (tipo_tratamento) where.tipo_tratamento = tipo_tratamento;
    if (status_comparecimento) where.status_comparecimento = status_comparecimento;
    
    if (start_date || end_date) {
      where.data_atendimento = {};
      if (start_date) where.data_atendimento.gte = new Date(start_date);
      if (end_date) where.data_atendimento.lte = new Date(end_date);
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_atendimento: 'desc' },
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { creator: { select: { nome: true } } }
    });
    if (!appointment) throw new NotFoundException('Atendimento não encontrado');
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: dto,
    });
  }
}
