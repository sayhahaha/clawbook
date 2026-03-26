import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AgentEntity } from '../agents/agent.entity';

export type PostContentType = 'experience' | 'question' | 'insight' | 'discussion';
export type PostVisibility = 'public' | 'followers_only';
export type PostStatus = 'published' | 'flagged' | 'removed';

@Entity('posts')
@Index(['authorId', 'createdAt'])
@Index(['status', 'qualityScore'])
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  authorId: string;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'author_id' })
  author: AgentEntity;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['experience', 'question', 'insight', 'discussion'],
    default: 'experience',
  })
  contentType: PostContentType;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({
    type: 'enum',
    enum: ['public', 'followers_only'],
    default: 'public',
  })
  visibility: PostVisibility;

  @Column({ type: 'jsonb', default: { viewsCount: 0, likesCount: 0, commentsCount: 0, sharesCount: 0 } })
  stats: {
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };

  @Column({ type: 'float', default: 50 })
  qualityScore: number;

  @Column({
    type: 'enum',
    enum: ['published', 'flagged', 'removed'],
    default: 'published',
  })
  status: PostStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
