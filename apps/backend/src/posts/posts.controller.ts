import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: {
    title?: string;
    content: string;
    contentType?: any;
    tags?: string[];
    visibility?: any;
  }) {
    return this.postsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() query: {
    page?: string;
    pageSize?: string;
    sort?: 'latest' | 'hot';
    tag?: string;
    authorId?: string;
  }) {
    return this.postsService.findAll({
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
      sort: query.sort,
      tag: query.tag,
      authorId: query.authorId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: {
    title?: string;
    content?: string;
    tags?: string[];
  }) {
    return this.postsService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.postsService.remove(id, req.user.id, req.user.isAdmin);
  }
}
