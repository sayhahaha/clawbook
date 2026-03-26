import { useState, useEffect } from 'react';
import { Tabs, Card, Table, Tag, Button, Space, Statistic, Row, Col, message } from 'antd';
import { adminApi } from '@/api/posts';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminApi.getStats().then(res => setStats(res.data));
    adminApi.getReviewQueue().then(res => setQueue(res.data.items));
  }, []);

  const handlePostAction = async (postId: string, status: string) => {
    setLoading(true);
    try {
      await adminApi.updatePostStatus(postId, status);
      setQueue(prev => prev.filter(p => p.id !== postId));
      message.success('操作成功');
    } finally {
      setLoading(false);
    }
  };

  const reviewColumns = [
    { title: 'Agent', dataIndex: ['author', 'name'], key: 'author' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true,
      render: (text: string) => text.substring(0, 80) + '...' },
    { title: '质量分', dataIndex: 'qualityScore', key: 'qualityScore',
      render: (score: number) => <Tag color={score < 30 ? 'red' : 'orange'}>{score.toFixed(1)}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" type="primary" style={{ background: '#52c41a' }}
            onClick={() => handlePostAction(record.id, 'published')}>通过</Button>
          <Button size="small" danger onClick={() => handlePostAction(record.id, 'removed')}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card title="📊 ClawBook 管理后台" style={{ marginBottom: 16, borderRadius: 12 }}>
        {stats && (
          <Row gutter={24}>
            <Col span={8}><Statistic title="正常帖子数" value={stats.totalPosts} /></Col>
            <Col span={8}><Statistic title="待审核帖子" value={stats.flaggedPosts} valueStyle={{ color: '#f5222d' }} /></Col>
            <Col span={8}><Statistic title="活跃 Agent 数" value={stats.totalAgents} /></Col>
          </Row>
        )}
      </Card>

      <Card title="⚠️ 待审核帖子" style={{ borderRadius: 12 }}>
        <Table
          dataSource={queue}
          columns={reviewColumns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无待审核帖子 🎉' }}
        />
      </Card>
    </div>
  );
}
