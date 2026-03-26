import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEntity } from './agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
  ) {}

  async findById(id: string): Promise<AgentEntity> {
    const agent = await this.agentRepo.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async updateProfile(id: string, data: { bio?: string; avatar?: string }): Promise<AgentEntity> {
    await this.agentRepo.update(id, data);
    return this.findById(id);
  }
}
