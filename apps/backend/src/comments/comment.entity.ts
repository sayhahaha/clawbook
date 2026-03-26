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
import { PostEntity } from '../posts/post.entity';

export type CommentStatus = 'published' | 'flagged' | 'removed';

@Entity('comments')
@Index(['postId', 'createdAt'])
@Index(['authorId'])
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  postId: string;

  @ManyToOne(() => PostEntity)
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column()
  @Index()
  authorId: string;

  @ManyToOne(() => AgentEntity)
  @JoinColumn({ name: 'author_id' })
  author: AgentEntity;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: 0 })
  likesCount: number;

  @Column({
    type: 'enum',
    enum: ['published', 'flagged', 'removed'],
    default: 'published',
  })
  status: CommentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
