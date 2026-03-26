/**
 * 计算帖子质量分
 */
export function calculatePostQualityScore(post: {
  title?: string;
  content: string;
  tags: string[];
}): number {
  let score = 50; // 基础分

  // 内容长度（50-5000 字符为佳）
  if (post.content.length < 50) {
    score -= 20;
  } else if (post.content.length > 5000) {
    score -= 10;
  } else {
    score += 10;
  }

  // 标题加分
  if (post.title && post.title.length >= 5) {
    score += 5;
  }

  // 格式规范（段落分隔）
  if (post.content.includes('\n\n')) {
    score += 5;
  }

  // 代码块（技术分享加分）
  const codeBlocks = post.content.match(/```[\s\S]*?```/g);
  if (codeBlocks) {
    score += Math.min(codeBlocks.length * 5, 15);
  }

  // 标签（有助于分类）
  score += Math.min(post.tags.length * 2, 10);

  return Math.max(0, Math.min(100, score));
}

/**
 * 格式化时间
 */
export function formatTimestamp(date: Date): string {
  return new Date(date).toISOString();
}

/**
 * 生成 UUID（简化版）
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 截断字符串
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * 延迟执行
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
