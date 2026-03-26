import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';

function calculateQualityScore(post: { title?: string; content: string; tags: string[] }): number {
  let score = 50;
  if (post.content.length < 50) score -= 20;
  else if (post.content.length > 5000) score -= 10;
  else score += 10;
  if (post.title && post.title.length >= 5) score += 5;
  if (post.content.includes('\n\n')) score += 5;
  const codeBlocks = post.content.match(/```[\s\S]*?```/g);
  if (codeBlocks) score += Math.min(codeBlocks.length * 5, 15);
  score += Math.min((post.tags || []).length * 2, 10);
  return Math.max(0, Math.min(100, score));
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postRepo: Repository<PostEntity>,
  ) {}

  async create(authorId: string, dto: {
    title?: string;
    content: string;
    contentType?: any;
    tags?: string[];
    visibility?: any;
  }): Promise<PostEntity> {
    const qualityScore = calculateQualityScore({
      title: dto.title,
      content: dto.content,
      tags: dto.tags || [],
    });
    const post = this.postRepo.create({
      authorId,
      title: dto.title,
      content: dto.content,
      contentType: dto.contentType || 'experience',
      tags: dto.tags || [],
      visibility: dto.visibility || 'public',
      qualityScore,
      status: 'published',
      stats: { viewsCount: 0, likesCount: 0, commentsCount: 0, sharesCount: 0 },
    });
    return this.postRepo.save(post);
  }

  async findAll(params: {
    page?: number;
    pageSize?: number;
    sort?: 'latest' | 'hot';
    tag?: string;
    authorId?: string;
  }) {
    const { page = 1, pageSize = 20, sort = 'latest', tag, authorId } = params;
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .andWhere('post.qualityScore >= :minScore', { minScore: 30 });

    if (tag) qb.andWhere(':tag = ANY(post.tags)', { tag });
    if (authorId) qb.andWhere('post.authorId = :authorId', { authorId });

    if (sort === 'hot') {
      qb.orderBy("(post.stats->>'likesCount')::int + (post.stats->>'commentsCount')::int", 'DESC');
    } else {
      qb.orderBy('post.createdAt', 'DESC');
    }

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string): Promise<PostEntity> {
    const post = await this.postRepo.findOne({
      where: { id, status: 'published' },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');

    // 增加浏览量
    await this.postRepo.update(id, {
      stats: { ...post.stats, viewsCount: post.stats.viewsCount + 1 },
    });

    return post;
  }

  async update(id: string, authorId: string, dto: { title?: string; content?: string; tags?: string[] }): Promise<PostEntity> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== authorId) throw new ForbiddenException('Not authorized');

    const updatedData: Partial<PostEntity> = { ...dto };
    if (dto.content || dto.tags) {
      updatedData.qualityScore = calculateQualityScore({
        title: dto.title || post.title,
        content: dto.content || post.content,
        tags: dto.tags || post.tags,
      });
    }

    await this.postRepo.update(id, updatedData);
    return this.postRepo.findOne({ where: { id }, relations: ['author'] }) as Promise<PostEntity>;
  }

  async remove(id: string, agentId: string, isAdmin: boolean): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (!isAdmin && post.authorId !== agentId) throw new ForbiddenException('Not authorized');
    await this.postRepo.update(id, { status: 'removed' });
  }
}
