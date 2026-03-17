import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.ativo) throw new UnauthorizedException('Credenciais inválidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const access_token = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'secret', expiresIn: '15m' }
    );
    const refresh_token = this.jwt.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret', expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refresh_token,
        expires_at: expiresAt,
      },
    });

    return {
      access_token,
      refresh_token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    };
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!stored || stored.expires_at.getTime() < new Date().getTime()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { token } });
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const payload = this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret' });
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    
    if (!user || !user.ativo) throw new UnauthorizedException('Usuário inativo ou não existe');

    const access_token = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_SECRET || 'secret', expiresIn: '15m' }
    );
    return { access_token };
  }

  async logout(token: string) {
    try {
      if (token) {
        await this.prisma.refreshToken.delete({ where: { token } });
      }
    } catch(e) {
      // Ignora erro se não existir
    }
  }
}
