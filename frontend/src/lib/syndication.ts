/**
 * Multi-Channel Content Syndication & Social Formatter
 *
 * Tự động chuyển đổi và đóng gói bài viết mới để phân phối đa kênh:
 * 1. Telegram Channel Message (MarkdownV2 chuẩn).
 * 2. Discord Webhook Embed (Rich Embed với thumbnail, tags, color).
 * 3. Social Media Snippet (Twitter/X thread, Facebook/Zalo post).
 * 4. Webhook Dispatcher: Tự động bắn thông báo khi có bài viết mới.
 */

import { SITE_URL } from './site';

export interface ArticleForSyndication {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  takeaways?: string[];
  thumbnail?: string;
  tags?: string[];
  publishedAt?: string;
}

/**
 * Format bài viết cho kênh Telegram Channel (MarkdownV2)
 */
export function formatTelegramPost(article: ArticleForSyndication, locale = 'vi'): string {
  const url = `${SITE_URL}/${locale}/${article.category}/${article.slug}`;
  const categoryUpper = article.category.toUpperCase();

  const takeawaysText = article.takeaways && article.takeaways.length > 0
    ? `\n\n📌 *Điểm chính:*\n${article.takeaways.map((t) => `• ${escapeTelegram(t)}`).join('\n')}`
    : '';

  const tagsText = article.tags && article.tags.length > 0
    ? `\n\n${article.tags.map((t) => `#${t.replace(/[^a-zA-Z0-9_]/g, '')}`).join(' ')}`
    : '';

  return `🔴 *[${categoryUpper}] ${escapeTelegram(article.title)}*\n\n${escapeTelegram(article.excerpt)}${takeawaysText}\n\n👉 [Đọc toàn bộ bài báo](${url})${tagsText}`;
}

/**
 * Format payload cho Discord Webhook
 */
export function formatDiscordPayload(article: ArticleForSyndication, locale = 'vi') {
  const url = `${SITE_URL}/${locale}/${article.category}/${article.slug}`;
  const colors: Record<string, number> = {
    tech: 0x3b82f6,
    blockchain: 0x8b5cf6,
    finance: 0x10b981,
    game: 0xef4444,
    sports: 0xf59e0b,
    world: 0x64748b,
  };

  return {
    username: 'News Studio Bot',
    avatar_url: `${SITE_URL}/icon.svg`,
    embeds: [
      {
        title: article.title,
        url,
        description: article.excerpt,
        color: colors[article.category] || 0xdc2626,
        thumbnail: article.thumbnail ? { url: article.thumbnail } : undefined,
        fields: [
          { name: 'Chuyên mục', value: article.category.toUpperCase(), inline: true },
          { name: 'Thời gian', value: new Date(article.publishedAt || Date.now()).toLocaleTimeString('vi-VN'), inline: true },
        ],
        footer: {
          text: 'News Studio • Kỷ Nguyên Báo Chí Đa Chiều',
        },
      },
    ],
  };
}

/**
 * Bắn webhook tự động tới Telegram và Discord nếu được cấu hình
 */
export async function dispatchArticleWebhooks(
  article: ArticleForSyndication,
  env?: { TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string; DISCORD_WEBHOOK_URL?: string }
): Promise<{ telegram: boolean; discord: boolean }> {
  let telegramSuccess = false;
  let discordSuccess = false;

  // 1. Gửi Telegram
  const tgToken = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const tgChatId = env?.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (tgToken && tgChatId) {
    try {
      const text = formatTelegramPost(article);
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      });
      telegramSuccess = res.ok;
    } catch (e) {
      console.warn('⚠️ [Syndication] Lỗi gửi Telegram:', e);
    }
  }

  // 2. Gửi Discord
  const discordUrl = env?.DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (discordUrl) {
    try {
      const payload = formatDiscordPayload(article);
      const res = await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      discordSuccess = res.ok;
    } catch (e) {
      console.warn('⚠️ [Syndication] Lỗi gửi Discord:', e);
    }
  }

  return { telegram: telegramSuccess, discord: discordSuccess };
}

function escapeTelegram(str: string): string {
  return str.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
