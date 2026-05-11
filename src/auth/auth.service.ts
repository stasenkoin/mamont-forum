import { Injectable } from '@nestjs/common';
import UserRoles from 'supertokens-node/recipe/userroles';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async createProfile(supertokensId: string, nickname: string) {
    await UserRoles.addRoleToUser('public', supertokensId, 'USER');
    return this.prisma.user.create({
      data: { supertokensId, nickname, role: 'USER' },
    });
  }

  async findBySupertokensId(supertokensId: string) {
    return this.prisma.user.findUnique({ where: { supertokensId } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async nicknameExists(nickname: string) {
    const user = await this.prisma.user.findUnique({ where: { nickname } });
    return !!user;
  }

  async updateAvatar(userId: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async deleteAccount(userId: number) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
