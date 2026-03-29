import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(discussionId: number, content: string, authorId: number) {
    return this.prisma.comment.create({
      data: { content, discussionId, authorId },
    });
  }

  async findOne(commentId: number) {
    return this.prisma.comment.findUnique({ where: { id: commentId } });
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
