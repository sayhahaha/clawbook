import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InteractionEntity, InteractionTargetType, InteractionActionType } from './interaction.entity';
import { PostEntity } from '../posts/post.entity';
import { AgentEntity } from '../agents/agent.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(InteractionEntity)
    private interactionRepo: Repository<InteractionEntity>,
    @InjectRepository(PostEntity)
    private postRepo: Repository<PostEntity>,
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
  ) {}

  async addInteraction(
    agentId: string,
    targetType: InteractionTargetType,
    targetId: string,
    actionType: InteractionActionType,
  ) {
    const existing = await this.interactionRepo.findOne({
      where: { agentId, targetType, targetId, actionType },
    });
    if (existing) throw new ConflictException('Already interacted');

    const interaction = this.interactionRepo.create({ agentId, targetType, targetId, actionType });
    await this.interactionRepo.save(interaction);

    // 更新统计数
    if (targetType === 'post' && actionType === 'like') {
      const post = await this.postRepo.findOne({ where: { id: targetId } });
      if (post) {
        await this.postRepo.update(targetId, {
          stats: { ...post.stats, likesCount: post.stats.likesCount + 1 },
        });
      }
    } else if (targetType === 'agent' && actionType === 'follow') {
      const agent = await this.agentRepo.findOne({ where: { id: targetId } });
      if (agent) {
        await this.agentRepo.update(targetId, {
          stats: { ...agent.stats, followersCount: agent.stats.followersCount + 1 },
        });
      }
    }

    return { success: true };
  }

  async removeInteraction(
    agentId: string,
    targetType: InteractionTargetType,
    targetId: string,
    actionType: InteractionActionType,
  ) {
    const result = await this.interactionRepo.delete({ agentId, targetType, targetId, actionType });

    // 更新统计数
    if (targetType === 'post' && actionType === 'like') {
      const post = await this.postRepo.findOne({ where: { id: targetId } });
      if (post && post.stats.likesCount > 0) {
        await this.postRepo.update(targetId, {
          stats: { ...post.stats, likesCount: post.stats.likesCount - 1 },
        });
      }
    } else if (targetType === 'agent' && actionType === 'follow') {
      const agent = await this.agentRepo.findOne({ where: { id: targetId } });
      if (agent && agent.stats.followersCount > 0) {
        await this.agentRepo.update(targetId, {
          stats: { ...agent.stats, followersCount: agent.stats.followersCount - 1 },
        });
      }
    }

    return { success: true };
  }

  async checkInteraction(
    agentId: string,
    targetType: InteractionTargetType,
    targetId: string,
    actionType: InteractionActionType,
  ) {
    const exists = await this.interactionRepo.findOne({
      where: { agentId, targetType, targetId, actionType },
    });
    return { exists: !!exists };
  }
}
