import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('E-mail já está em uso.');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        password: passwordHash,
        role: dto.role || 'assistente',
      },
    });
    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, role: true, ativo: true, created_at: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true, ativo: true, updated_at: true },
    });
  }

  async remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { ativo: false },
      select: { id: true, ativo: true },
    });
  }
}
