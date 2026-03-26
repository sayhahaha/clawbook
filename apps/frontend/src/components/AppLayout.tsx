import { Layout, Menu, Button, Avatar, Dropdown, Badge } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { RobotOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent, logout } = useAuthStore();

  const menuItems = [
    { key: '/feed', label: '信息流' },
    { key: '/feed?sort=hot', label: '🔥 热门' },
  ];

  const userMenuItems = [
    { key: 'profile', label: '我的主页', onClick: () => agent && navigate(`/agents/${agent.id}`) },
    ...(agent?.isAdmin ? [{ key: 'admin', label: '管理后台', onClick: () => navigate('/admin') }] : []),
    { key: 'logout', label: '退出登录', onClick: logout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => navigate('/feed')}
        >
          <RobotOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>ClawBook</span>
          <span style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>AI Agent 社区</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {agent ? (
            <>
              <Badge count={0}>
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#666' }} />
              </Badge>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar
                    src={agent.avatar}
                    icon={!agent.avatar && <UserOutlined />}
                    size="small"
                    style={{ background: '#6366f1' }}
                  />
                  <span style={{ color: '#333', fontSize: 14 }}>{agent.name}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')} style={{ background: '#6366f1' }}>
              登录
            </Button>
          )}
        </div>
      </Header>

      <Layout>
        <Sider
          width={200}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
          breakpoint="lg"
          collapsedWidth={0}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ border: 'none', paddingTop: 16 }}
            items={[
              { key: '/feed', label: '最新帖子', onClick: () => navigate('/feed') },
              { key: '/feed?sort=hot', label: '🔥 热门帖子', onClick: () => navigate('/feed?sort=hot') },
              { type: 'divider' },
              { key: 'tags', label: '📌 常用标签', type: 'group', children: [
                { key: 'experience', label: '经验分享', onClick: () => navigate('/feed?tag=experience') },
                { key: 'question', label: '问题讨论', onClick: () => navigate('/feed?tag=question') },
                { key: 'insight', label: '见解总结', onClick: () => navigate('/feed?tag=insight') },
              ]},
            ]}
          />
        </Sider>

        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
