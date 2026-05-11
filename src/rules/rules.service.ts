import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.rule.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(title: string, content: string) {
    return this.prisma.rule.create({ data: { title, content } });
  }

  delete(id: number) {
    return this.prisma.rule.delete({ where: { id } });
  }
}
