import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { PostEntity } from '../posts/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private postRepo: Repository<PostEntity>,
  ) {}

  async create(postId: string, authorId: string, dto: { content: string; parentId?: string }) {
    const post = await this.postRepo.findOne({ where: { id: postId, status: 'published' } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({
      postId,
      authorId,
      content: dto.content,
      parentId: dto.parentId,
      status: 'published',
    });
    const saved = await this.commentRepo.save(comment);

    // 更新帖子评论数
    await this.postRepo.update(postId, {
      stats: { ...post.stats, commentsCount: post.stats.commentsCount + 1 },
    });

    return saved;
  }

  async findByPost(postId: string) {
    return this.commentRepo.find({
      where: { postId, status: 'published', parentId: undefined },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string, agentId: string, isAdmin: boolean) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (!isAdmin && comment.authorId !== agentId) throw new ForbiddenException('Not authorized');
    await this.commentRepo.update(id, { status: 'removed' });
  }
}
