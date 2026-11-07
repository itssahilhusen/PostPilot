/**
 * Multi-channel notification dispatcher for Reerts Autonomous Daily Flywheel
 * Supports Discord Webhooks (rich embeds + action links), Slack Webhooks, and Telegram.
 */

export interface PostNotificationPayload {
  postId: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  sourceTitle?: string;
  themeStyle: string;
  brandHandle?: string;
  slideCount: number;
  slidesPreview: { heading: string; subtext: string }[];
  caption: string;
  hashtags: string[];
  scheduledTime?: string;
  appBaseUrl?: string;
}

export async function sendFlywheelNotification(
  channel: "discord" | "telegram" | "slack",
  webhookUrl: string,
  payload: PostNotificationPayload,
  telegramOpts?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl && channel !== "telegram") {
    return { success: false, error: "No webhook URL provided" };
  }

  const baseUrl = payload.appBaseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const approveUrl = `${baseUrl}/api/automations/daily-pipeline/review?action=approve&postId=${encodeURIComponent(payload.postId)}`;
  const studioUrl = `${baseUrl}/studio?tab=design&postId=${encodeURIComponent(payload.postId)}`;
  const calendarUrl = `${baseUrl}/calendar`;

  try {
    if (channel === "discord") {
      return await sendDiscordEmbed(webhookUrl, payload, { approveUrl, studioUrl, calendarUrl });
    } else if (channel === "slack") {
      return await sendSlackBlock(webhookUrl, payload, { approveUrl, studioUrl, calendarUrl });
    } else if (channel === "telegram") {
      return await sendTelegramMessage(telegramOpts?.botToken, telegramOpts?.chatId, payload, {
        approveUrl,
        studioUrl,
        calendarUrl,
      });
    }

    return { success: false, error: `Unsupported channel: ${channel}` };
  } catch (err: any) {
    console.error(`[Flywheel Notification Error]`, err);
    return { success: false, error: err.message || "Failed to dispatch notification" };
  }
}

/**
 * Dispatches a Discord Rich Embed with color-coded theme tags, slide breakdown, and 1-click links
 */
async function sendDiscordEmbed(
  webhookUrl: string,
  payload: PostNotificationPayload,
  urls: { approveUrl: string; studioUrl: string; calendarUrl: string }
): Promise<{ success: boolean; error?: string }> {
  // Electric cyan or neon green embed color
  const color = payload.themeStyle.toLowerCase().includes("future") ? 0x00e5ff : 0xc6f432;

  const slidesFieldText = payload.slidesPreview
    .slice(0, 5)
    .map((s, idx) => `**Slide ${idx + 1}**: ${s.heading}\n_${s.subtext}_`)
    .join("\n\n");

  const discordBody = {
    username: "Reerts Autonomous Flywheel",
    avatar_url: "https://reerts.in/favicon.ico",
    embeds: [
      {
        title: `⚡ Daily Faceless Deck Generated: "${payload.title}"`,
        url: urls.studioUrl,
        description: `Your autonomous daily news scout curated today's top story and generated a **${payload.slideCount}-slide carousel** in the **${payload.themeStyle}** faceless theme.`,
        color,
        fields: [
          {
            name: "📰 Source Story",
            value: `[${payload.sourceTitle || "Read Original Story"}](${payload.sourceUrl || "https://tldr.tech"})\n${payload.summary.slice(0, 200)}...`,
            inline: false,
          },
          {
            name: "📑 Carousel Slides Breakdown",
            value: slidesFieldText || "Multi-slide structured deck generated",
            inline: false,
          },
          {
            name: "📱 Social Media Caption",
            value: `\`\`\`text\n${payload.caption.slice(0, 280)}...\n\`\`\``,
            inline: false,
          },
          {
            name: "🎯 One-Click Creator Actions",
            value: `[✅ **Approve & Schedule (10:00 AM)**](${urls.approveUrl})\n[🎨 **Open & Retouch in Reerts Studio**](${urls.studioUrl})\n[📅 **View Content Calendar**](${urls.calendarUrl})`,
            inline: false,
          },
        ],
        footer: {
          text: `Reerts Faceless Engine • Channel: ${payload.brandHandle || "@theaiseed"} • Reply or click to approve`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return { success: false, error: `Discord webhook HTTP ${res.status}: ${errorText}` };
  }

  return { success: true };
}

/**
 * Dispatches a Slack Incoming Webhook
 */
async function sendSlackBlock(
  webhookUrl: string,
  payload: PostNotificationPayload,
  urls: { approveUrl: string; studioUrl: string; calendarUrl: string }
): Promise<{ success: boolean; error?: string }> {
  const slackBody = {
    text: `⚡ Daily Reerts Carousel Ready: ${payload.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `⚡ Daily Carousel Ready: ${payload.title}`,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Theme Style:* ${payload.themeStyle} | *Slides:* ${payload.slideCount} | *Brand:* ${payload.brandHandle || "@theaiseed"}\n*Source:* <${payload.sourceUrl || "#"}|${payload.sourceTitle || "Original Article"}>`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Curated Takeaway:*\n>${payload.summary.slice(0, 200)}...`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "✅ Approve & Schedule" },
            style: "primary",
            url: urls.approveUrl,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "🎨 Retouch in Studio" },
            url: urls.studioUrl,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "📅 View Calendar" },
            url: urls.calendarUrl,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slackBody),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Slack webhook HTTP ${res.status}: ${errText}` };
  }

  return { success: true };
}

/**
 * Dispatches a Telegram Bot notification
 */
async function sendTelegramMessage(
  botToken?: string,
  chatId?: string,
  payload?: PostNotificationPayload,
  urls?: { approveUrl: string; studioUrl: string; calendarUrl: string }
): Promise<{ success: boolean; error?: string }> {
  if (!botToken || !chatId || !payload || !urls) {
    return { success: false, error: "Telegram botToken and chatId are required" };
  }

  const text = `⚡ *Daily Reerts Deck Ready for Review*
*Title:* ${escapeTelegram(payload.title)}
*Theme:* ${escapeTelegram(payload.themeStyle)}
*Brand:* ${escapeTelegram(payload.brandHandle || "@theaiseed")}

*Summary:*
${escapeTelegram(payload.summary.slice(0, 180))}...

*Action Links:*
• [Approve & Schedule for 10:00 AM](${urls.approveUrl})
• [Open & Retouch in Reerts Studio](${urls.studioUrl})
• [View Content Calendar](${urls.calendarUrl})`;

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Telegram HTTP ${res.status}: ${errText}` };
  }

  return { success: true };
}

function escapeTelegram(str: string): string {
  return str.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
}

