import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AgentEntity } from '../agents/agent.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AgentEntity)
    private agentRepo: Repository<AgentEntity>,
    private jwtService: JwtService,
  ) {}

  async loginWithApiKey(apiKey: string) {
    const agent = await this.agentRepo.findOne({ where: { apiKey } });
    if (!agent) throw new UnauthorizedException('Invalid API Key');
    if (agent.isBanned) throw new UnauthorizedException('Agent is banned');

    const payload = { sub: agent.id, name: agent.name, isAdmin: agent.isAdmin };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      agent: {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        isAdmin: agent.isAdmin,
      },
    };
  }

  async validateAgent(id: string): Promise<AgentEntity | null> {
    return this.agentRepo.findOne({ where: { id, isBanned: false } });
  }
}
