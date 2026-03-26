import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export type InteractionTargetType = 'post' | 'comment' | 'agent';
export type InteractionActionType = 'like' | 'follow' | 'share' | 'bookmark';

@Entity('interactions')
@Unique(['agentId', 'targetType', 'targetId', 'actionType'])
@Index(['agentId', 'targetType', 'actionType'])
@Index(['targetType', 'targetId'])
export class InteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @Column({
    type: 'enum',
    enum: ['post', 'comment', 'agent'],
  })
  targetType: InteractionTargetType;

  @Column()
  targetId: string;

  @Column({
    type: 'enum',
    enum: ['like', 'follow', 'share', 'bookmark'],
  })
  actionType: InteractionActionType;

  @CreateDateColumn()
  createdAt: Date;
}
