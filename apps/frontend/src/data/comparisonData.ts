export interface Competitor {
  id: string;
  name: string;
  url: string;
  logo: string;
}

export interface ComparisonCell {
  status: string;
  note: string;
}

export interface ComparisonRow {
  feature: string;
  icon: string;
  values: Record<string, ComparisonCell>;
}

export const competitors: Competitor[] = [
  {
    "id": "buffer",
    "name": "Buffer",
    "url": "https://buffer.com/",
    "logo": "/images/competitors/buffer.svg"
  },
  {
    "id": "manychat",
    "name": "ManyChat",
    "url": "https://manychat.com/",
    "logo": "/images/competitors/manychat.svg"
  },
  {
    "id": "opusclip",
    "name": "OpusClip",
    "url": "https://www.opus.pro/",
    "logo": "/images/competitors/opusclip.png"
  },
  {
    "id": "hootsuite",
    "name": "Hootsuite",
    "url": "https://www.hootsuite.com/",
    "logo": "/images/competitors/hootsuite.png"
  },
  {
    "id": "later",
    "name": "Later",
    "url": "https://later.com/",
    "logo": "/images/competitors/later.png"
  },
  {
    "id": "metricool",
    "name": "Metricool",
    "url": "https://metricool.com/",
    "logo": "/images/competitors/metricool.png"
  },
  {
    "id": "postiz",
    "name": "Postiz",
    "url": "https://postiz.com/",
    "logo": "/images/competitors/postiz.png"
  },
  {
    "id": "typefully",
    "name": "Typefully",
    "url": "https://typefully.com/",
    "logo": "/images/competitors/typefully.png"
  },
  {
    "id": "postbridge",
    "name": "Post Bridge",
    "url": "https://www.post-bridge.com/",
    "logo": "/images/competitors/postbridge.png"
  }
];

export const comparisonRows: ComparisonRow[] = [
  {
    "feature": "Marketing automation pipeline",
    "icon": "route",
    "values": {
      "reerts": {
        "status": "Coming soon",
        "note": "A pipeline connecting content collection through performance review is coming soon."
      },
      "buffer": {
        "status": "Outside scope",
        "note": "Automation means connecting outside tools like Zapier, Make, or MCP to Buffer. You build the flow yourself."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Its automation flows focus on DMs and customer conversations."
      },
      "opusclip": {
        "status": "Partial",
        "note": "One video URL flows through clip selection, editing, and scheduled publishing, and the API and webhooks can automate it. Source collection, review, and performance review are not part of the flow."
      },
      "hootsuite": {
        "status": "Outside scope",
        "note": "Offers discovery, drafts, approvals, scheduling, and analytics separately. Its own page states people remain in control of reviewing, approving, and publishing."
      },
      "later": {
        "status": "Outside scope",
        "note": "Offers sourcing, drafts, approvals, scheduling, and analytics separately. Its feature list has no option that runs the steps in sequence."
      },
      "metricool": {
        "status": "Outside scope",
        "note": "Its automation covers comment and DM replies. Anything else is wired up through the API or Make."
      },
      "postiz": {
        "status": "Partial",
        "note": "An RSS feed connects sourcing, drafting, and scheduling. Selection means picking the feed yourself, and approvals carry no state a flow could wait on."
      },
      "typefully": {
        "status": "Outside scope",
        "note": "Connects outside AI tools that draft and schedule for you. Sourcing and selection are not part of the product."
      },
      "postbridge": {
        "status": "Outside scope",
        "note": "External agents call it through the API and MCP to write and schedule. It offers no sourcing, selection, or review tools."
      }
    }
  },
  {
    "feature": "Brand-voice writing",
    "icon": "wand",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Analyze your account's existing posts to build a brand voice, then draft and edit posts in it."
      },
      "buffer": {
        "status": "Partial",
        "note": "Offers AI post writing and tone adjustments, but you set the tone each time. Its own page states account details and posts are never sent to the AI."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Learns a voice from your profile and comments, but only for DM and comment replies. It cannot write a post to publish."
      },
      "opusclip": {
        "status": "Partial",
        "note": "AI generates clip titles, descriptions, and hashtags. There is no brand voice learned from your posts; brand templates apply visual elements such as captions and logos."
      },
      "hootsuite": {
        "status": "Partial",
        "note": "Offers per-account brand voice personalization, but draws on the accounts you select and what is already in the composer. It keeps no chat history."
      },
      "later": {
        "status": "Partial",
        "note": "Its caption writer works from the description you type, with a casual, professional, or custom tone. No brand voice is stored."
      },
      "metricool": {
        "status": "Partial",
        "note": "Lets you save written tone instructions per brand. No learning from past posts appears in its guides."
      },
      "postiz": {
        "status": "Partial",
        "note": "AI writes the post, and the tone is a choice between personal and company. Its docs describe no voice learned from account history."
      },
      "typefully": {
        "status": "Supported",
        "note": "Automatically learns how you open posts, your sentence length, and your word choice from what you published, then writes and refines in that voice."
      },
      "postbridge": {
        "status": "Partial",
        "note": "A free TikTok caption tool generates text from a topic, tone, and target audience. Inside the app, per-platform captions are edited by hand."
      }
    }
  },
  {
    "feature": "AI carousel creation",
    "icon": "carousel-horizontal",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Turns a link, your posts, a file, text, or a topic into a carousel, then refines the design with templates extracted from other carousels and an in-app editor."
      },
      "buffer": {
        "status": "Outside scope",
        "note": "Retired its own image creation tools in 2024 and points to its Canva integration instead. Carousels publish images you already made."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Does not publish social posts at all. Its card and gallery blocks are for DM conversations."
      },
      "opusclip": {
        "status": "Outside scope",
        "note": "A video clipping tool only. It does not create or edit image slides."
      },
      "hootsuite": {
        "status": "Outside scope",
        "note": "Schedules carousels by adding up to 20 photos you already made. Design happens through Canva and Adobe Express templates."
      },
      "later": {
        "status": "Outside scope",
        "note": "Its AI features are caption writing and content ideas. Carousels are multi-photo posts you schedule."
      },
      "metricool": {
        "status": "Outside scope",
        "note": "Carousels publish images you already made. In its own guide, the carousel agent has Claude design the slides while Metricool schedules them."
      },
      "postiz": {
        "status": "Outside scope",
        "note": "AI generation covers one image, video, and text. LinkedIn carousels combine images you upload into a PDF for publishing."
      },
      "typefully": {
        "status": "Outside scope",
        "note": "LinkedIn carousels convert a PDF you made yourself. Its AI features are writing and image descriptions."
      },
      "postbridge": {
        "status": "Outside scope",
        "note": "Carousels take multiple images you upload and order. Its free splitter cuts one image into several slices."
      }
    }
  },
  {
    "feature": "AI Reels creation",
    "icon": "scissors",
    "values": {
      "reerts": {
        "status": "Coming soon",
        "note": "Short-form video generation and editing are coming soon."
      },
      "buffer": {
        "status": "Unconfirmed",
        "note": "Video scheduling is supported; native video generation and editing could not be verified."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Focuses on conversations and message automation rather than producing videos for publishing."
      },
      "opusclip": {
        "status": "Supported",
        "note": "Builds short-form clips with AI clipping plus animated captions, B-roll, reframing, and timeline editing. Editing requires Starter or above."
      },
      "hootsuite": {
        "status": "Unconfirmed",
        "note": "Video publishing and scheduling are supported; native video generation and editing could not be verified."
      },
      "later": {
        "status": "Partial",
        "note": "Offers video trimming and Reels audio. Automatic short-form generation is unconfirmed."
      },
      "metricool": {
        "status": "Partial",
        "note": "Offers splitting, merging, trimming, aspect ratios, and text. Automatic short-form generation is unconfirmed."
      },
      "postiz": {
        "status": "Supported",
        "note": "Generates vertical videos with Veo3 or narrated image slides and provides an in-app Polotno image/video editor. Generation limits and editor setup vary by plan and deployment."
      },
      "typefully": {
        "status": "Unconfirmed",
        "note": "Supports uploading and scheduling finished videos. Native short-form video generation and editing are not confirmed."
      },
      "postbridge": {
        "status": "Supported",
        "note": "Content Studio creates videos from templates and supports drag-and-drop editing. Available on Creator and higher plans."
      }
    }
  },
  {
    "feature": "Long to Shorts",
    "icon": "movie",
    "values": {
      "reerts": {
        "status": "Coming soon",
        "note": "Automatic short-form clip generation from long-form video is coming soon."
      },
      "buffer": {
        "status": "Outside scope",
        "note": "Buffer points to external editors such as VEED and Kapwing for video editing. It has no clip generation of its own."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Focuses on conversations and message automation rather than producing videos for publishing."
      },
      "opusclip": {
        "status": "Supported",
        "note": "ClipAnything analyzes a long video and produces multiple short clips with virality scores. It accepts URLs from YouTube, Zoom, Drive, and more, plus file uploads."
      },
      "hootsuite": {
        "status": "Outside scope",
        "note": "Its video editor covers trimming, filters, stickers, and audio. Automatic clip generation from a long video is not in the guide."
      },
      "later": {
        "status": "Outside scope",
        "note": "Trims video length and crops to platform ratios when scheduling. It does not pick highlights to make clips."
      },
      "metricool": {
        "status": "Outside scope",
        "note": "Offers trimming, splitting, merging, and aspect ratios. Automatic clip generation from a long video is not in the guide."
      },
      "postiz": {
        "status": "Outside scope",
        "note": "AI video is generated fresh from Veo3 prompts or image-and-narration slides. Splitting an existing long video into clips is not in the docs."
      },
      "typefully": {
        "status": "Unconfirmed",
        "note": "Supports uploading and scheduling finished videos; clip generation from a long video could not be verified."
      },
      "postbridge": {
        "status": "Unconfirmed",
        "note": "Content Studio covers template-based video creation and basic editing. Automatic clip generation from a long video could not be verified."
      }
    }
  },
  {
    "feature": "AI agent scheduling",
    "icon": "robot",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Schedule and publish text to Threads, X, and LinkedIn, and video or media to TikTok, Instagram, and YouTube, through API and MCP."
      },
      "buffer": {
        "status": "Supported",
        "note": "Its official MCP supports drafts, scheduling, queue access, saving ideas, and analytics."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Offers a messaging API, which is outside the scope of social post scheduling and publishing."
      },
      "opusclip": {
        "status": "Supported",
        "note": "The API creates, schedules, and publishes clips, and an MCP connector is offered. API access is on Pro (Beta), Max, and Business; MCP on Pro and Business."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Perch MCP lets AI tools draft, schedule, publish, and retrieve performance data."
      },
      "later": {
        "status": "Unconfirmed",
        "note": "Smart Scheduling is available; AI scheduling through a public API or MCP could not be verified."
      },
      "metricool": {
        "status": "Supported",
        "note": "Its official MCP and API support scheduling, analytics, best times, and competitor data."
      },
      "postiz": {
        "status": "Supported",
        "note": "Official MCP, API, and CLI let AI tools create drafts, schedule, and publish immediately. MCP also supports image and video generation."
      },
      "typefully": {
        "status": "Supported",
        "note": "Official MCP and API let AI tools draft, schedule, publish, and manage queues for X, LinkedIn, Threads, Bluesky, and Mastodon."
      },
      "postbridge": {
        "status": "Supported",
        "note": "Official MCP and REST API support creating, scheduling, and publishing posts from AI tools, plus draft and media management."
      }
    }
  },
  {
    "feature": "Multi-channel scheduling",
    "icon": "calendar",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Manage posts and publishing schedules for multiple social accounts in one place."
      },
      "buffer": {
        "status": "Supported",
        "note": "Manage publishing queues and schedules across channels."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Does not provide a social post scheduling calendar."
      },
      "opusclip": {
        "status": "Partial",
        "note": "Schedules and auto-posts clips to YouTube, Instagram Reels, TikTok, Facebook Pages, LinkedIn Business, and X from a calendar. Text and image posts cannot be published, and Threads is not supported."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Schedule and publish posts to major social platforms."
      },
      "later": {
        "status": "Supported",
        "note": "Schedule and publish across social channels from a calendar."
      },
      "metricool": {
        "status": "Supported",
        "note": "Manage multi-platform publishing, scheduling, and recurring posts."
      },
      "postiz": {
        "status": "Supported",
        "note": "Schedule and publish across social accounts from one calendar, with channel-specific content and posting times."
      },
      "typefully": {
        "status": "Supported",
        "note": "Schedules and publishes to X, LinkedIn, Threads, Bluesky, Mastodon, and Substack Notes. LinkedIn supports personal profiles and Pages."
      },
      "postbridge": {
        "status": "Supported",
        "note": "Schedules posts to multiple accounts across 10 platforms, with a calendar and a queue of recurring time slots."
      }
    }
  },
  {
    "feature": "Social inbox",
    "icon": "message-circle",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Manage comments, mentions, and DMs together. Channel support varies; X DMs require Pro or above."
      },
      "buffer": {
        "status": "Partial",
        "note": "Unifies social comments and suggests AI replies. Unified DM support is unconfirmed."
      },
      "manychat": {
        "status": "Partial",
        "note": "Unifies DMs and customer conversations across Messenger, Instagram, WhatsApp, and more. Coverage of all public comments is unconfirmed."
      },
      "opusclip": {
        "status": "Outside scope",
        "note": "There is no way to read or reply to comments and DMs. It focuses on making and publishing clips."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Nest unifies comments and messages from multiple channels."
      },
      "later": {
        "status": "Supported",
        "note": "Growth and above support Instagram/Facebook comments and DMs, plus TikTok comments."
      },
      "metricool": {
        "status": "Supported",
        "note": "Manage comments and messages from supported platforms in its Inbox."
      },
      "postiz": {
        "status": "Unconfirmed",
        "note": "Its LinkedIn page mentions a comment and DM inbox, but supported channels and the scope of unified replies could not be verified in the user documentation."
      },
      "typefully": {
        "status": "Unconfirmed",
        "note": "Supports draft comments and Slack notifications. A unified inbox for public comments and incoming DMs is not confirmed."
      },
      "postbridge": {
        "status": "Unconfirmed",
        "note": "A unified inbox for viewing and replying to public comments and incoming DMs is not confirmed in the official documentation."
      }
    }
  },
  {
    "feature": "Unified analytics",
    "icon": "chart-bar",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Review post performance across all seven networks in one place. Available metrics, account types, and historical post coverage vary by platform."
      },
      "buffer": {
        "status": "Supported",
        "note": "The new Insights covers post performance across all seven networks. Available metrics differ by platform — X omits reach and comments, TikTok omits impressions."
      },
      "manychat": {
        "status": "Partial",
        "note": "A paid beta rolling out gradually analyzes Instagram post reach, engagement, and automation performance. It currently supports Instagram only."
      },
      "opusclip": {
        "status": "Partial",
        "note": "Clip analytics is available on the Business plan and marked coming soon for Pro. Threads is not a publishing channel, so it does not cover all seven networks."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Compares posts from all seven networks in one table. Instagram, Facebook, and LinkedIn support varies by account type and plan."
      },
      "later": {
        "status": "Partial",
        "note": "Analyzes Instagram, Facebook, TikTok, Threads, and LinkedIn personal profiles. Support for X ended in 2025, and YouTube can be scheduled but not analyzed."
      },
      "metricool": {
        "status": "Supported",
        "note": "Reports post metrics for all seven networks. On some plans, X and LinkedIn personal profiles only show posts published through Metricool."
      },
      "postiz": {
        "status": "Partial",
        "note": "LinkedIn analytics covers company Pages only, not personal profiles. Its docs state that only 10 of the 34 connectable channels report analytics back."
      },
      "typefully": {
        "status": "Partial",
        "note": "Currently analyzes X posts only; LinkedIn analytics are in development. Includes posts published directly on X, but excludes Community posts."
      },
      "postbridge": {
        "status": "Partial",
        "note": "Its API spec defines analytics for three networks: TikTok, Instagram, and YouTube. The metrics are views, likes, comments, and shares; X, LinkedIn, and Threads are absent."
      }
    }
  },
  {
    "feature": "DM Automation",
    "icon": "robot",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Automate Instagram/Facebook comment responses and Instagram DM keyword replies."
      },
      "buffer": {
        "status": "Unconfirmed",
        "note": "Reply-writing assistance is confirmed; comment and DM trigger automation could not be verified."
      },
      "manychat": {
        "status": "Supported",
        "note": "Offers comment-to-DM, keywords, default replies, conditional branches, and conversation automation."
      },
      "opusclip": {
        "status": "Outside scope",
        "note": "It has no comment-triggered or DM keyword auto-replies."
      },
      "hootsuite": {
        "status": "Partial",
        "note": "Instagram comment keywords can trigger replies and DMs. Incoming DM keyword conditions are unconfirmed."
      },
      "later": {
        "status": "Unconfirmed",
        "note": "Comment and DM keyword automation could not be verified in official information."
      },
      "metricool": {
        "status": "Supported",
        "note": "Flows supports Instagram comment, DM, and story keywords, plus TikTok comment management."
      },
      "postiz": {
        "status": "Unconfirmed",
        "note": "Offers automatic reposts and follow-up comments triggered by like counts. Replies triggered by comment text or incoming DM keywords are unconfirmed."
      },
      "typefully": {
        "status": "Partial",
        "note": "Sends automated X DMs after interactions such as replies or reposts. Keyword-triggered replies to incoming DMs are not confirmed."
      },
      "postbridge": {
        "status": "Unconfirmed",
        "note": "Automatic replies triggered by comments and keywords in incoming DMs are not confirmed in the official documentation."
      }
    }
  },
  {
    "feature": "Competitor spy",
    "icon": "spy",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Compare competitor accounts and recent post performance, then use the findings for content ideas."
      },
      "buffer": {
        "status": "Unconfirmed",
        "note": "Tracking selected competitors' accounts and posts could not be verified in official information."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Focuses on conversations and message automation rather than competitor account analysis."
      },
      "opusclip": {
        "status": "Outside scope",
        "note": "It does not track competitor accounts or their post performance."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Offers competitor monitoring and performance analysis."
      },
      "later": {
        "status": "Supported",
        "note": "Scale lets you compare up to 20 Instagram competitor accounts."
      },
      "metricool": {
        "status": "Supported",
        "note": "Analyze competitors' accounts, posts, and performance."
      },
      "postiz": {
        "status": "Unconfirmed",
        "note": "Provides analytics for connected accounts and posts. Tracking selected competitors' accounts and posts could not be verified in the official documentation."
      },
      "typefully": {
        "status": "Unconfirmed",
        "note": "Tracking posts and performance for selected competitor accounts is not confirmed in the official documentation."
      },
      "postbridge": {
        "status": "Unconfirmed",
        "note": "Native tracking and comparison of selected competitor accounts and their post performance are not confirmed in the official documentation."
      }
    }
  },
  {
    "feature": "Content feeds",
    "icon": "rss",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Collect new material from subscribed channels for content discovery and drafting."
      },
      "buffer": {
        "status": "Supported",
        "note": "Create connects to RSS feeds and automatically collects fresh content."
      },
      "manychat": {
        "status": "Outside scope",
        "note": "Focuses on conversations and message automation rather than source feed subscriptions."
      },
      "opusclip": {
        "status": "Outside scope",
        "note": "Videos are submitted one at a time by URL or upload. It does not subscribe to channels or RSS feeds to keep collecting new material."
      },
      "hootsuite": {
        "status": "Partial",
        "note": "Connect the RSS Auto Publisher app to bring in RSS content."
      },
      "later": {
        "status": "Unconfirmed",
        "note": "UGC collection is available; external channel and RSS subscriptions could not be verified."
      },
      "metricool": {
        "status": "Supported",
        "note": "RSS Feed and Autolists collect external content for publishing."
      },
      "postiz": {
        "status": "Supported",
        "note": "Automatically collects new RSS items, optionally generates AI copy and images, and schedules or publishes them. Cloud requires Team or above."
      },
      "typefully": {
        "status": "Partial",
        "note": "A Zapier workflow uses OpenAI to summarize new RSS items and create Typefully drafts. This requires a separately configured external integration."
      },
      "postbridge": {
        "status": "Unconfirmed",
        "note": "Subscriptions that continually collect new content from external channels or RSS feeds are not confirmed in the official documentation."
      }
    }
  },
  {
    "feature": "Client account connection",
    "icon": "users",
    "values": {
      "reerts": {
        "status": "Supported",
        "note": "Invite clients with the Client role and they connect their own accounts on all seven platforms' official login screens. Clients only see the workspace they're invited to, never your team or billing."
      },
      "buffer": {
        "status": "Partial",
        "note": "On the Team plan, a client invited as an Admin can connect their own channels. Admins can manage every channel connected to the organization, so Buffer's own guide advises against this when clients' channels must stay separate."
      },
      "manychat": {
        "status": "Partial",
        "note": "The client connects the channel to their own ManyChat account, then invites the agency as an Admin. Each channel has its own account and billing, so channels can't be pooled in an agency workspace."
      },
      "opusclip": {
        "status": "Unconfirmed",
        "note": "There's no connection link. Team invites exist, but whether invited members can connect social accounts, and any client role, could not be verified in official information."
      },
      "hootsuite": {
        "status": "Supported",
        "note": "Invite the client as a member with only the custom permission to connect social accounts, and they connect directly. Custom permissions come with Advanced and higher plans, and each invited client needs a paid seat."
      },
      "later": {
        "status": "Supported",
        "note": "Invite the client as a user and assign them to a client-specific Access Group, and they connect their own profiles. Available on Growth and higher; subscription settings stay hidden from them."
      },
      "metricool": {
        "status": "Supported",
        "note": "A connection link lets clients connect networks without a Metricool account. Links expire after 71 hours; available on Advanced and Custom plans."
      },
      "postiz": {
        "status": "Supported",
        "note": "An invite link lets clients approve on the platform's own screen without a Postiz account, adding the channel to the agency's organization. Platforms that need passwords or API keys typed in (such as Bluesky) are excluded."
      },
      "typefully": {
        "status": "Supported",
        "note": "On the Business plan, a client invited as a team Admin connects their own accounts. Connecting requires the Admin role, which also grants team member management."
      },
      "postbridge": {
        "status": "Partial",
        "note": "A connect link created through the API or MCP lets clients connect without logging in to Post Bridge. It currently covers only Instagram, Facebook and TikTok."
      }
    }
  }
];
