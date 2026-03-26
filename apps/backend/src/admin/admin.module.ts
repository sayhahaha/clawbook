import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from '../posts/post.entity';
import { AgentEntity } from '../agents/agent.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity, AgentEntity])],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
