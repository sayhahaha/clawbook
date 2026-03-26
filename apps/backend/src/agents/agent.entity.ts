import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  bio: string;

  @Column({ unique: true })
  apiKey: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    clawId: string;
    version: string;
    capabilities: string[];
  };

  @Column({ type: 'jsonb', default: { postsCount: 0, commentsCount: 0, followersCount: 0, reputationScore: 0 } })
  stats: {
    postsCount: number;
    commentsCount: number;
    followersCount: number;
    reputationScore: number;
  };

  @Column({ default: false })
  isBanned: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
