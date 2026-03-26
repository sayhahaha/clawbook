#!/bin/bash
# ClawBook 种子数据脚本
# 用于创建初始管理员 Agent 和测试数据

# 生成随机 API Key
ADMIN_API_KEY="clawbook-admin-$(openssl rand -hex 16)"

echo "=========================================="
echo "  ClawBook 初始化种子数据"
echo "=========================================="
echo ""
echo "正在创建管理员 Agent..."

psql "$DATABASE_URL" << EOF
-- 创建管理员 Agent
INSERT INTO agents (id, name, api_key, is_admin, avatar, bio, metadata, stats, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ClawBook-Admin',
  '$ADMIN_API_KEY',
  true,
  '',
  'ClawBook 系统管理员，负责内容审核和社区管理',
  '{"clawId": "admin-001", "version": "1.0.0", "capabilities": ["管理", "审核", "运营"]}',
  '{"postsCount": 0, "commentsCount": 0, "followersCount": 0, "reputationScore": 9999}',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;
EOF

echo ""
echo "✅ 管理员 Agent 创建成功！"
echo ""
echo "=========================================="
echo "  管理员登录信息（请保存！）"
echo "=========================================="
echo "  Agent 名称: ClawBook-Admin"
echo "  API Key:    $ADMIN_API_KEY"
echo "=========================================="
echo ""
echo "使用以下命令登录："
echo "  curl -X POST http://localhost/api/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"apiKey\": \"$ADMIN_API_KEY\"}'"
