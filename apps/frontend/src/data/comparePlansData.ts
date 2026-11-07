export interface PlanFeatureItem {
  feature: string;
  creator: string;
  pro: string;
  team: string;
}

export interface PlanFeatureCategory {
  name: string;
  items: PlanFeatureItem[];
}

export const planCategories: PlanFeatureCategory[] = [
  {
    "name": "Limits & Pricing",
    "items": [
      {
        "feature": "AI Credits",
        "creator": "1,500 /month",
        "pro": "5,000 /month",
        "team": "12,000 /month"
      },
      {
        "feature": "Social Accounts",
        "creator": "3",
        "pro": "10",
        "team": "20"
      },
      {
        "feature": "Media Library",
        "creator": "30 GB",
        "pro": "100 GB",
        "team": "300 GB"
      },
      {
        "feature": "Content idea sources",
        "creator": "30",
        "pro": "100",
        "team": "300"
      },
      {
        "feature": "API &amp; MCP",
        "creator": "3,000 /month",
        "pro": "7,500 /month",
        "team": "15,000 /month"
      },
      {
        "feature": "Extra AI Credits",
        "creator": "$0.03 /credit",
        "pro": "$0.02 /credit",
        "team": "$0.01 /credit"
      },
      {
        "feature": "Extra Social Account",
        "creator": "$5 per account/month",
        "pro": "$5 per account/month",
        "team": "$5 per account/month"
      },
      {
        "feature": "Extra User Seat",
        "creator": "-",
        "pro": "$5 per user/month",
        "team": "$5 per user/month"
      },
      {
        "feature": "Extra Workspace",
        "creator": "$5 per workspace/month",
        "pro": "$5 per workspace/month",
        "team": "$5 per workspace/month"
      }
    ]
  },
  {
    "name": "Brand Voice Analysis",
    "items": [
      {
        "feature": "Own Account",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Reference Accounts",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Includes sub-threads in analysis (X, Threads)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "AI Content Ideation",
    "items": [
      {
        "feature": "Auto Search",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Manual Search",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "AI Creation",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "From Uploaded Files",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "AI Content Creation",
    "items": [
      {
        "feature": "Idea → Content",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Link (URL) → Content",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Text → Content",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "File → Content",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Mobile share → Content",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Repurpose",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Best Content Remix",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "AI writing assistant (translate, spellcheck, humanize)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "AI Image Generation",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "AI carousel creation",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Carousel template extraction",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "Collaboration &amp; Access Control",
    "items": [
      {
        "feature": "User Seats",
        "creator": "1",
        "pro": "3+",
        "team": "5+"
      },
      {
        "feature": "Role-Based Permissions",
        "creator": "-",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Workspaces",
        "creator": "1+",
        "pro": "5+",
        "team": "10+"
      }
    ]
  },
  {
    "name": "Social Media Operations",
    "items": [
      {
        "feature": "Instant &amp; Scheduled Post",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Threaded Post",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Cross-Platform Post",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Schedule Window",
        "creator": "Up to 1 year",
        "pro": "Up to 1 year",
        "team": "Up to 1 year"
      },
      {
        "feature": "Content Calendar",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Unified social inbox (comments, mentions &amp; DMs)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Resource emails from comments &amp; DMs",
        "creator": "-",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "X direct messages",
        "creator": "-",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "LinkedIn First Comment",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "LinkedIn document (PDF carousel)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "X Community Post",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Instagram First Comment",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "YouTube First Comment",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Recurring Post",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Canva &amp; Figma integration",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Unsplash stock photos",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "Comment &amp; DM Automation",
    "items": [
      {
        "feature": "Comment-to-DM automation (Instagram · Facebook)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Keyword auto-reply &amp; auto hide/delete",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Lead capture (email &amp; follow gate, CSV export)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "Data Analytics",
    "items": [
      {
        "feature": "Post Performance Analytics",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Download Posts with metrics (CSV, JSON)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "X Post History",
        "creator": "Last 100",
        "pro": "Last 100",
        "team": "Last 100"
      },
      {
        "feature": "LinkedIn Post History",
        "creator": "All",
        "pro": "All",
        "team": "All"
      },
      {
        "feature": "Threads Post History",
        "creator": "All",
        "pro": "All",
        "team": "All"
      },
      {
        "feature": "AI Performance Analysis &amp; Action Plan",
        "creator": "included",
        "pro": "included",
        "team": "included"
      }
    ]
  },
  {
    "name": "Discovery",
    "items": [
      {
        "feature": "Competitor Spy",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "Content idea sources",
        "creator": "30",
        "pro": "100",
        "team": "300"
      }
    ]
  },
  {
    "name": "API &amp; MCP",
    "items": [
      {
        "feature": "API",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "MCP (AI app integration)",
        "creator": "included",
        "pro": "included",
        "team": "included"
      },
      {
        "feature": "API &amp; MCP",
        "creator": "3,000 /month",
        "pro": "7,500 /month",
        "team": "15,000 /month"
      }
    ]
  }
];
