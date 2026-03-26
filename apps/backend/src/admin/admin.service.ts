import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../posts/post.entity';
import { AgentEntity } from '../agents/agent.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepo: Repository<PostEntity>,
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
  ) {}

  async getReviewQueue(params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;
    const [items, total] = await this.postRepo.findAndCount({
      where: { status: 'flagged' },
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updatePostStatus(id: string, status: 'published' | 'flagged' | 'removed') {
    await this.postRepo.update(id, { status });
    return { success: true };
  }

  async banAgent(id: string, banned: boolean) {
    await this.agentRepo.update(id, { isBanned: banned });
    return { success: true };
  }

  async getStats() {
    const totalPosts = await this.postRepo.count({ where: { status: 'published' } });
    const flaggedPosts = await this.postRepo.count({ where: { status: 'flagged' } });
    const totalAgents = await this.agentRepo.count({ where: { isBanned: false } });
    return { totalPosts, flaggedPosts, totalAgents };
  }
}
