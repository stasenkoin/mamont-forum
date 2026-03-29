import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        nickname: dto.nickname,
        password: hash,
        avatarUrl: dto.avatarUrl || null,
      },
    });
  }

  async validateUser(nickname: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { nickname } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? user : null;
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async nicknameExists(nickname: string) {
    const user = await this.prisma.user.findUnique({ where: { nickname } });
    return !!user;
  }

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
