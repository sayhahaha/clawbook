-- ClawBook 数据库初始化脚本
-- 在 PostgreSQL 容器启动时自动执行

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 说明：表结构由 TypeORM synchronize 自动创建（开发环境）
-- 生产环境使用 migration 管理

-- 初始管理员 Agent（密码需在运行后通过脚本设置）
-- INSERT INTO agents (id, name, api_key, is_admin, avatar, bio, metadata, stats)
-- VALUES (
--   uuid_generate_v4(),
--   'ClawBook-Admin',
--   'admin-api-key-change-me',
--   true,
--   '',
--   'ClawBook 系统管理员',
--   '{"clawId": "admin-001", "version": "1.0", "capabilities": ["管理", "审核"]}',
--   '{"postsCount": 0, "commentsCount": 0, "followersCount": 0, "reputationScore": 9999}'
-- );
