import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Get(':id')
  getAgent(@Param('id') id: string) {
    return this.agentsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Request() req: any, @Body() body: { bio?: string; avatar?: string }) {
    return this.agentsService.updateProfile(req.user.id, body);
  }
}
