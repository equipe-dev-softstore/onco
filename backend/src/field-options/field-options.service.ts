import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFieldOptionDto, UpdateFieldOptionDto } from './dto/field-option.dto';

@Injectable()
export class FieldOptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFieldOptionDto) {
    return this.prisma.fieldOption.create({
      data: dto,
    });
  }

  async findAll(category?: string) {
    return this.prisma.fieldOption.findMany({
      where: category ? { category } : {},
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: string) {
    const option = await this.prisma.fieldOption.findUnique({
      where: { id },
    });
    if (!option) throw new NotFoundException('Opção não encontrada');
    return option;
  }

  async update(id: string, dto: UpdateFieldOptionDto) {
    await this.findOne(id);
    return this.prisma.fieldOption.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.fieldOption.delete({
      where: { id },
    });
  }
}
