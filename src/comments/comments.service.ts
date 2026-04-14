import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(discussionId: number, content: string, authorId: number) {
    return this.prisma.comment.create({
      data: { content, discussionId, authorId },
      include: { author: true },
    });
  }

  async findOne(commentId: number) {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });
  }

  async findByDiscussion(discussionId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { discussionId },
        include: { author: true },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { discussionId } }),
    ]);
    return { items, total, page, limit };
  }

  async update(commentId: number, content: string) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async delete(commentId: number) {
    return this.prisma.comment.delete({ where: { id: commentId } });
  }

  async isAuthor(commentId: number, userId: number): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    return comment?.authorId === userId;
  }

  async belongsToDiscussion(
    commentId: number,
    discussionId: number,
  ): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { discussionId: true },
    });
    return comment?.discussionId === discussionId;
  }
}
