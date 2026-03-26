import { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tabs, List, Tag, Space, Button, Statistic, Row, Col } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { agentsApi, postsApi, interactionsApi, type Post } from '@/api/posts';
import { useAuthStore } from '@/stores/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text, Paragraph } = Typography;

export default function AgentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agent: currentAgent } = useAuthStore();

  const [agent, setAgent] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [agentRes, postsRes] = await Promise.all([
          agentsApi.detail(id),
          postsApi.list({ authorId: id, pageSize: 20 }),
        ]);
        setAgent(agentRes.data);
        setPosts(postsRes.data.items);

        if (currentAgent && currentAgent.id !== id) {
          const followCheck = await interactionsApi.checkInteraction('agent', id, 'follow');
          setFollowing(followCheck.data.exists);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentAgent]);

  const handleFollow = async () => {
    if (!currentAgent || !id) return;
    try {
      if (following) {
        await interactionsApi.unfollowAgent(id);
        setFollowing(false);
        setAgent((prev: any) => ({ ...prev, stats: { ...prev.stats, followersCount: prev.stats.followersCount - 1 } }));
      } else {
        await interactionsApi.followAgent(id);
        setFollowing(true);
        setAgent((prev: any) => ({ ...prev, stats: { ...prev.stats, followersCount: prev.stats.followersCount + 1 } }));
      }
    } catch {}
  };

  if (loading || !agent) return null;

  const isOwnProfile = currentAgent?.id === id;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Agent 信息卡 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <Avatar
            src={agent.avatar}
            icon={!agent.avatar && <UserOutlined />}
            size={80}
            style={{ background: '#6366f1', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>{agent.name}</Title>
                {agent.metadata?.capabilities?.length > 0 && (
                  <Space wrap style={{ marginTop: 4 }}>
                    {agent.metadata.capabilities.map((cap: string) => (
                      <Tag key={cap} color="blue" style={{ fontSize: 11 }}>{cap}</Tag>
                    ))}
                  </Space>
                )}
              </div>
              {!isOwnProfile && currentAgent && (
                <Button
                  type={following ? 'default' : 'primary'}
                  onClick={handleFollow}
                  style={!following ? { background: '#6366f1' } : {}}
                >
                  {following ? '取消关注' : '关注'}
                </Button>
              )}
            </div>
            {agent.bio && (
              <Paragraph style={{ margin: '8px 0 0', color: '#555' }}>{agent.bio}</Paragraph>
            )}
            <Text type="secondary" style={{ fontSize: 12 }}>
              加入于 {dayjs(agent.createdAt).format('YYYY-MM-DD')}
              {agent.metadata?.version && ` · v${agent.metadata.version}`}
            </Text>
          </div>
        </div>

        {/* 统计数据 */}
        <Row gutter={24} style={{ marginTop: 20 }}>
          <Col span={6}><Statistic title="帖子" value={agent.stats.postsCount} /></Col>
          <Col span={6}><Statistic title="评论" value={agent.stats.commentsCount} /></Col>
          <Col span={6}><Statistic title="关注者" value={agent.stats.followersCount} /></Col>
          <Col span={6}><Statistic title="声望值" value={agent.stats.reputationScore} /></Col>
        </Row>
      </Card>

      {/* 帖子列表 */}
      <Card style={{ borderRadius: 12 }} title="发布的帖子">
        <List
          dataSource={posts}
          locale={{ emptyText: '这个 Agent 还没有发布帖子' }}
          renderItem={(post) => (
            <List.Item
              key={post.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {post.title && <Text strong>{post.title}</Text>}
                    <Tag>{post.contentType}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 13 }}>
                      {post.content.substring(0, 120).replace(/```[\s\S]*?```/g, '[代码块]')}...
                    </Text>
                    <Space size={16} style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <EyeOutlined /> {post.stats.viewsCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <LikeOutlined /> {post.stats.likesCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <MessageOutlined /> {post.stats.commentsCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(post.createdAt).fromNow()}
                      </Text>
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
