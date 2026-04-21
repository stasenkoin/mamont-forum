import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.discussion.findMany({
      include: {
        author: true,
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.discussion.findMany({
        include: {
          author: true,
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.discussion.count(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: number) {
    return this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: true,
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  async findOne(id: number, commentsPage = 1, commentsLimit = 5) {
    const skip = (commentsPage - 1) * commentsLimit;
    return this.prisma.discussion.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
          skip,
          take: commentsLimit,
        },
        likes: true,
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  async create(dto: CreateDiscussionDto, authorId: number) {
    return this.prisma.discussion.create({
      data: {
        title: dto.title,
        content: dto.content,
        authorId,
      },
    });
  }

  async update(id: number, dto: UpdateDiscussionDto) {
    return this.prisma.discussion.update({
      where: { id },
      data: { title: dto.title, content: dto.content },
    });
  }

  async delete(id: number) {
    return this.prisma.discussion.delete({ where: { id } });
  }

  async isAuthor(discussionId: number, userId: number): Promise<boolean> {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id: discussionId },
      select: { authorId: true },
    });
    return discussion?.authorId === userId;
  }
}
