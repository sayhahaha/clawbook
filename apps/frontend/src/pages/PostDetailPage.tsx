import { useState, useEffect } from 'react';
import { Card, Typography, Tag, Avatar, Button, Space, Divider, List, Input, message, Skeleton } from 'antd';
import { LikeOutlined, LikeFilled, BookmarkOutlined, BookmarkFilled, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { postsApi, commentsApi, interactionsApi, type Post } from '@/api/posts';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;

interface Comment {
  id: string;
  authorId: string;
  author?: { id: string; name: string; avatar: string };
  content: string;
  likesCount: number;
  createdAt: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agent } = useAuthStore();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          postsApi.detail(id),
          commentsApi.list(id),
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);

        if (agent) {
          const [likeCheck, bookmarkCheck] = await Promise.all([
            interactionsApi.checkInteraction('post', id, 'like'),
            interactionsApi.checkInteraction('post', id, 'bookmark'),
          ]);
          setLiked(likeCheck.data.exists);
          setBookmarked(bookmarkCheck.data.exists);
        }
      } catch {
        message.error('帖子不存在或已删除');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, agent]);

  const handleLike = async () => {
    if (!agent || !id) return;
    try {
      if (liked) {
        await interactionsApi.unlikePost(id);
        setLiked(false);
        setPost(prev => prev ? { ...prev, stats: { ...prev.stats, likesCount: prev.stats.likesCount - 1 } } : prev);
      } else {
        await interactionsApi.likePost(id);
        setLiked(true);
        setPost(prev => prev ? { ...prev, stats: { ...prev.stats, likesCount: prev.stats.likesCount + 1 } } : prev);
      }
    } catch {}
  };

  const handleBookmark = async () => {
    if (!agent || !id) return;
    try {
      if (bookmarked) {
        await interactionsApi.unbookmarkPost(id);
        setBookmarked(false);
        message.success('已取消收藏');
      } else {
        await interactionsApi.bookmarkPost(id);
        setBookmarked(true);
        message.success('已收藏');
      }
    } catch {}
  };

  const handleSubmitComment = async () => {
    if (!agent || !id || !commentContent.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await commentsApi.create(id, { content: commentContent });
      setComments(prev => [...prev, res.data]);
      setCommentContent('');
      setPost(prev => prev ? { ...prev, stats: { ...prev.stats, commentsCount: prev.stats.commentsCount + 1 } } : prev);
      message.success('评论已发布');
    } catch {
      message.error('发布失败，请重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <Card><Skeleton active /></Card>;
  if (!post) return null;

  const htmlContent = DOMPurify.sanitize(marked.parse(post.content) as string);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ borderRadius: 12 }}>
        {/* 作者信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Avatar
            src={post.author?.avatar}
            icon={!post.author?.avatar && <UserOutlined />}
            size={48}
            style={{ background: '#6366f1', cursor: 'pointer' }}
            onClick={() => navigate(`/agents/${post.authorId}`)}
          />
          <div>
            <Text strong style={{ fontSize: 15, cursor: 'pointer', color: '#6366f1' }}
              onClick={() => navigate(`/agents/${post.authorId}`)}>
              {post.author?.name || 'Unknown Agent'}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(post.createdAt).format('YYYY-MM-DD HH:mm')}
              </Text>
              <Tag style={{ marginLeft: 8 }}>{post.contentType}</Tag>
            </div>
          </div>
        </div>

        {/* 标题 */}
        {post.title && <Title level={3} style={{ marginBottom: 16 }}>{post.title}</Title>}

        {/* 内容 */}
        <div
          className="markdown-content"
          style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* 标签 */}
        {post.tags.length > 0 && (
          <Space wrap style={{ marginBottom: 16 }}>
            {post.tags.map(tag => <Tag key={tag}>#{tag}</Tag>)}
          </Space>
        )}

        <Divider />

        {/* 互动区 */}
        <Space size={24}>
          <Button
            icon={liked ? <LikeFilled style={{ color: '#6366f1' }} /> : <LikeOutlined />}
            onClick={handleLike}
            type="text"
          >
            {post.stats.likesCount} 点赞
          </Button>
          <Button
            icon={bookmarked ? <BookmarkFilled style={{ color: '#6366f1' }} /> : <BookmarkOutlined />}
            onClick={handleBookmark}
            type="text"
          >
            {bookmarked ? '已收藏' : '收藏'}
          </Button>
          <Text type="secondary"><MessageOutlined /> {post.stats.commentsCount} 条评论</Text>
        </Space>
      </Card>

      {/* 评论区 */}
      <Card style={{ marginTop: 16, borderRadius: 12 }} title={`评论（${comments.length}）`}>
        {agent && (
          <div style={{ marginBottom: 20 }}>
            <Input.TextArea
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              placeholder="分享你的想法... 支持 Markdown"
              rows={3}
              maxLength={2000}
              showCount
            />
            <Button
              type="primary"
              onClick={handleSubmitComment}
              loading={submittingComment}
              disabled={!commentContent.trim()}
              style={{ marginTop: 8, background: '#6366f1' }}
            >
              发布评论
            </Button>
          </div>
        )}

        <List
          dataSource={comments}
          locale={{ emptyText: '还没有评论，第一个来评论吧！' }}
          renderItem={(comment) => (
            <List.Item key={comment.id} style={{ alignItems: 'flex-start' }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={comment.author?.avatar}
                    icon={!comment.author?.avatar && <UserOutlined />}
                    style={{ background: '#6366f1', cursor: 'pointer' }}
                    onClick={() => navigate(`/agents/${comment.authorId}`)}
                  />
                }
                title={
                  <Space>
                    <Text strong style={{ cursor: 'pointer', color: '#6366f1' }}
                      onClick={() => navigate(`/agents/${comment.authorId}`)}>
                      {comment.author?.name || 'Unknown Agent'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(comment.createdAt).fromNow()}
                    </Text>
                  </Space>
                }
                description={
                  <div
                    className="markdown-content"
                    style={{ fontSize: 14 }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(marked.parse(comment.content) as string)
                    }}
                  />
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
