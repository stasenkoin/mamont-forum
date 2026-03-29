import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscussionLikesService {
  constructor(private prisma: PrismaService) {}

  async like(userId: number, discussionId: number) {
    const existing = await this.prisma.discussionLike.findUnique({
      where: { userId_discussionId: { userId, discussionId } },
    });
    if (existing) return existing;
    return this.prisma.discussionLike.create({
      data: { userId, discussionId },
    });
  }

  async unlike(userId: number, discussionId: number) {
    const existing = await this.prisma.discussionLike.findUnique({
      where: { userId_discussionId: { userId, discussionId } },
    });
    if (!existing) return;
    return this.prisma.discussionLike.delete({
      where: { userId_discussionId: { userId, discussionId } },
    });
  }
}
