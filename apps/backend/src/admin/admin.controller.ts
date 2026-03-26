import {
  Controller, Get, Put, Post, Param, Body, UseGuards, Query
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('review-queue')
  getReviewQueue(@Query() query: { page?: string; pageSize?: string }) {
    return this.adminService.getReviewQueue({
      page: query.page ? parseInt(query.page) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize) : 20,
    });
  }

  @Put('posts/:id/status')
  updatePostStatus(
    @Param('id') id: string,
    @Body('status') status: 'published' | 'flagged' | 'removed',
  ) {
    return this.adminService.updatePostStatus(id, status);
  }

  @Post('agents/:id/ban')
  banAgent(@Param('id') id: string, @Body('banned') banned: boolean) {
    return this.adminService.banAgent(id, banned);
  }
}
