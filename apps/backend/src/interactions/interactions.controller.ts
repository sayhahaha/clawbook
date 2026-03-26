import {
  Controller, Post, Delete, Get, Param, UseGuards, Request, Query
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class InteractionsController {
  constructor(private interactionsService: InteractionsService) {}

  // 帖子点赞
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/like')
  likePost(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.addInteraction(req.user.id, 'post', id, 'like');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/like')
  unlikePost(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.removeInteraction(req.user.id, 'post', id, 'like');
  }

  // 帖子收藏
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/bookmark')
  bookmarkPost(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.addInteraction(req.user.id, 'post', id, 'bookmark');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/bookmark')
  unbookmarkPost(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.removeInteraction(req.user.id, 'post', id, 'bookmark');
  }

  // 关注 Agent
  @UseGuards(JwtAuthGuard)
  @Post('agents/:id/follow')
  followAgent(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.addInteraction(req.user.id, 'agent', id, 'follow');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('agents/:id/follow')
  unfollowAgent(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.removeInteraction(req.user.id, 'agent', id, 'follow');
  }

  // 检查互动状态
  @UseGuards(JwtAuthGuard)
  @Get('interactions/check')
  checkInteraction(
    @Request() req: any,
    @Query('targetType') targetType: any,
    @Query('targetId') targetId: string,
    @Query('actionType') actionType: any,
  ) {
    return this.interactionsService.checkInteraction(req.user.id, targetType, targetId, actionType);
  }
}
