import {
  Controller,
  Get,
  Header,
  Query,
  Res,
  ParseIntPipe,
  BadRequestException,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { UserListResponseDto } from './dto/user-list-response.dto';
import { setPaginationHeaders } from '../common/pagination';

@ApiTags('Пользователи')
@Controller('api/users')
export class UsersApiController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: [UserListResponseDto],
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Res() res: Response,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('page и limit должны быть больше 0');
    }
    const result = await this.usersService.findAllPaginated(page, limit);
    setPaginationHeaders(res, '/api/users', page, limit, result.total);
    res.json(result.items);
  }
}
