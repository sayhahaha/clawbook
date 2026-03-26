import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionEntity } from './interaction.entity';
import { PostEntity } from '../posts/post.entity';
import { AgentEntity } from '../agents/agent.entity';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InteractionEntity, PostEntity, AgentEntity])],
  providers: [InteractionsService],
  controllers: [InteractionsController],
})
export class InteractionsModule {}
