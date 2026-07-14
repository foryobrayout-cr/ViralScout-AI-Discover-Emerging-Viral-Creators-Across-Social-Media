import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for active user sessions
let savedCollections: Array<{
  id: string;
  name: string;
  description?: string;
  creators: string[]; // Creator IDs
  notes: Record<string, string>; // Creator ID -> Custom Note
  tags: Record<string, string[]>; // Creator ID -> Custom Tags
}> = [
  {
    id: "folder-1",
    name: "AI & LLM Gems",
    description: "Rising micro-creators in the generative AI space with high view-to-sub ratios.",
    creators: ["yt-neoneural", "tt-bytesizeai"],
    notes: {
      "yt-neoneural": "Incredibly high retention on DeepSeek videos. Partner with them early.",
      "tt-bytesizeai": "Short-form master, gets 400k+ views consistently with 18k followers."
    },
    tags: {
      "yt-neoneural": ["AI", "Agents", "DeepSeek"],
      "tt-bytesizeai": ["Shorts", "AI Tools"]
    }
  },
  {
    id: "folder-2",
    name: "Language & Education",
    description: "Highly interactive niche educational pages.",
    creators: ["ig-espanolrapido"],
    notes: {
      "ig-espanolrapido": "Spanish Reels are getting 180k views. Engagement is over 16%."
    },
    tags: {
      "ig-espanolrapido": ["Spanish", "Language", "Reels"]
    }
  }
];

let smartAlerts: Array<{
  id: string;
  name: string;
  platform: string;
  criteria: {
    minViews?: number;
    maxSubscribers?: number;
    keyword?: string;
    minFollowerGain?: number;
  };
  isActive: boolean;
  createdAt: string;
}> = [
  {
    id: "alert-1",
    name: "Viral AI Channels (<20k Subs)",
    platform: "youtube",
    criteria: { minViews: 500000, maxSubscribers: 20000, keyword: "AI" },
    isActive: true,
    createdAt: "2026-07-10T12:00:00Z"
  },
  {
    id: "alert-2",
    name: "Exploding Spanish Learning",
    platform: "instagram",
    criteria: { keyword: "Spanish", minViews: 100000 },
    isActive: true,
    createdAt: "2026-07-12T08:30:00Z"
  }
];

// Simulated trigger logs for alert match events
let alertLogs: Array<{
  id: string;
  alertId: string;
  alertName: string;
  creatorId: string;
  creatorName: string;
  platform: string;
  triggerMessage: string;
  timestamp: string;
  isRead: boolean;
}> = [
  {
    id: "log-1",
    alertId: "alert-1",
    alertName: "Viral AI Channels (<20k Subs)",
    creatorId: "yt-neoneural",
    creatorName: "NeoNeural AI",
    platform: "youtube",
    triggerMessage: "Video 'Building a Local LLM Team in 10 Lines' reached 640k views (Subscribers: 12.4k)",
    timestamp: "2026-07-14T03:15:00Z",
    isRead: false
  },
  {
    id: "log-2",
    alertId: "alert-2",
    alertName: "Exploding Spanish Learning",
    creatorId: "ig-espanolrapido",
    creatorName: "Español Rápido",
    platform: "instagram",
    triggerMessage: "Reel 'Stop saying - Como estas' gained 180k views in 24 hours.",
    timestamp: "2026-07-14T04:45:00Z",
    isRead: false
  }
];

// Initial preloaded creators data
const INITIAL_CREATORS = [
  {
    id: "yt-neoneural",
    name: "NeoNeural AI",
    profileImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "youtube",
    description: "Deep dive tutorials on running advanced open-source LLMs locally, multi-agent frameworks, and building private offline AI pipelines.",
    followers: 12400,
    totalVideos: 34,
    averageViews: 180000,
    averageLikes: 14200,
    averageComments: 1800,
    engagementRate: 12.9,
    viralScore: 94,
    growthTrend: [
      { date: "May 2026", followers: 4500, views: 90000 },
      { date: "Jun 2026", followers: 7800, views: 130000 },
      { date: "Jul 2026", followers: 12400, views: 180000 }
    ],
    topPerformingContent: [
      { id: "v1", title: "Run DeepSeek R1 Locally: Complete Offline Guide", views: 680000, likes: 52000, date: "2 days ago" },
      { id: "v2", title: "Building a Private AI Agent Team (No-Code Framework)", views: 320000, likes: 24000, date: "1 week ago" }
    ],
    recentUploads: [
      { id: "v1", title: "Run DeepSeek R1 Locally: Complete Offline Guide", views: 680000, date: "2 days ago" },
      { id: "v2", title: "Building a Private AI Agent Team (No-Code Framework)", views: 320000, date: "1 week ago" },
      { id: "v3", title: "Fine-tune any 8B LLM on Your Laptop for $0", views: 110000, date: "2 weeks ago" }
    ],
    mainKeywords: ["AI", "Local LLM", "Ollama", "Agents", "DeepSeek", "Llama 3"],
    hashtags: ["#ai", "#localllm", "#deepseek", "#coding", "#tech"],
    category: "Technology",
    postingSchedule: "Twice a week (Tuesdays & Saturdays)",
    estimatedAudienceCountries: ["United States", "Germany", "United Kingdom", "India"],
    estimatedAudienceLanguage: "English",
    accountAgeMonths: 5,
    uploadFrequencyWeeks: 2.1
  },
  {
    id: "tt-bytesizeai",
    name: "ByteSizeAI",
    profileImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "tiktok",
    description: "Bite-sized productivity hacks, dynamic automation tutorials, and secret API integrations designed to save you 20+ hours a week.",
    followers: 18200,
    totalVideos: 82,
    averageViews: 420000,
    averageLikes: 54000,
    averageComments: 4200,
    engagementRate: 14.1,
    viralScore: 97,
    growthTrend: [
      { date: "May 2026", followers: 3200, views: 120000 },
      { date: "Jun 2026", followers: 9500, views: 280000 },
      { date: "Jul 2026", followers: 18200, views: 420000 }
    ],
    topPerformingContent: [
      { id: "t1", title: "This Free API literally writes all my emails 🤫", views: 1200000, likes: 110000, date: "3 days ago" },
      { id: "t2", title: "How to connect Google Sheets to your brain", views: 890000, likes: 78000, date: "5 days ago" }
    ],
    recentUploads: [
      { id: "t1", title: "This Free API literally writes all my emails 🤫", views: 1200000, date: "3 days ago" },
      { id: "t2", title: "How to connect Google Sheets to your brain", views: 890000, date: "5 days ago" },
      { id: "t3", title: "3 Free AI tools that feel highly illegal to know", views: 620000, date: "1 week ago" }
    ],
    mainKeywords: ["AI Automation", "Productivity", "API", "Google Sheets", "Hacks"],
    hashtags: ["#tech", "#productivity", "#aitools", "#developer", "#workflow"],
    category: "Productivity",
    postingSchedule: "Daily short-form",
    estimatedAudienceCountries: ["United States", "Canada", "Australia", "United Kingdom"],
    estimatedAudienceLanguage: "English",
    accountAgeMonths: 3,
    uploadFrequencyWeeks: 6.8
  },
  {
    id: "ig-espanolrapido",
    name: "Español Rápido",
    profileImage: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "instagram",
    description: "Learn practical, conversational Spanish with funny memes, real-world slang, and daily micro-scenarios.",
    followers: 6200,
    totalVideos: 45,
    averageViews: 180000,
    averageLikes: 19500,
    averageComments: 1200,
    engagementRate: 16.7,
    viralScore: 98,
    growthTrend: [
      { date: "May 2026", followers: 1100, views: 25000 },
      { date: "Jun 2026", followers: 2800, views: 80000 },
      { date: "Jul 2026", followers: 6200, views: 180000 }
    ],
    topPerformingContent: [
      { id: "i1", title: "Stop saying 'Cómo estás' - say this instead!", views: 510000, likes: 43000, date: "4 days ago" },
      { id: "i2", title: "Surviving at a Mexican taco stand slang guide 🌮", views: 320000, likes: 27000, date: "1 week ago" }
    ],
    recentUploads: [
      { id: "i1", title: "Stop saying 'Cómo estás' - say this instead!", views: 510000, date: "4 days ago" },
      { id: "i2", title: "Surviving at a Mexican taco stand slang guide 🌮", views: 320000, date: "1 week ago" },
      { id: "i3", title: "3 words that make you sound like a native", views: 220000, date: "2 weeks ago" }
    ],
    mainKeywords: ["Learn Spanish", "Slang", "Travel Spanish", "Bilingual"],
    hashtags: ["#learnspanish", "#mexicanslang", "#bilingual", "#espanol", "#languages"],
    category: "Education",
    postingSchedule: "Daily Reels",
    estimatedAudienceCountries: ["United States", "United Kingdom", "Spain", "Mexico"],
    estimatedAudienceLanguage: "Spanish",
    accountAgeMonths: 2,
    uploadFrequencyWeeks: 7.0
  },
  {
    id: "yt-microvc",
    name: "The Micro-VC",
    profileImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "youtube",
    description: "Deconstructing startup term sheets, funding rounds, and how bootstrapping startups are reaching $1M ARR with minimal funding.",
    followers: 15100,
    totalVideos: 19,
    averageViews: 95000,
    averageLikes: 8400,
    averageComments: 920,
    engagementRate: 11.2,
    viralScore: 86,
    growthTrend: [
      { date: "May 2026", followers: 6500, views: 40000 },
      { date: "Jun 2026", followers: 10200, views: 65000 },
      { date: "Jul 2026", followers: 15100, views: 95000 }
    ],
    topPerformingContent: [
      { id: "mv1", title: "How a Solo Dev Built a $80k/mo Micro-SaaS in 90 Days", views: 280000, likes: 21000, date: "2 weeks ago" },
      { id: "mv2", title: "Startup Pitch Decks That Raised Millions (Analysis)", views: 140000, likes: 9800, date: "3 weeks ago" }
    ],
    recentUploads: [
      { id: "mv1", title: "How a Solo Dev Built a $80k/mo Micro-SaaS in 90 Days", views: 280000, date: "2 weeks ago" },
      { id: "mv2", title: "Startup Pitch Decks That Raised Millions (Analysis)", views: 140000, date: "3 weeks ago" },
      { id: "mv3", title: "The Death of 100x VC Valuations", views: 80000, date: "1 month ago" }
    ],
    mainKeywords: ["Micro SaaS", "Venture Capital", "Bootstrapping", "Finance", "Solopreneur"],
    hashtags: ["#saas", "#venturecapital", "#startup", "#solopreneur", "#indiehackers"],
    category: "Finance & Business",
    postingSchedule: "Every Thursday",
    estimatedAudienceCountries: ["United States", "Singapore", "Canada", "United Kingdom"],
    estimatedAudienceLanguage: "English",
    accountAgeMonths: 4,
    uploadFrequencyWeeks: 1.0
  },
  {
    id: "tt-sidehustlescout",
    name: "SideHustleScout",
    profileImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "tiktok",
    description: "Testing viral remote side-hustles with zero-bias reviews and honest profit and loss dashboards.",
    followers: 9800,
    totalVideos: 32,
    averageViews: 250000,
    averageLikes: 21000,
    averageComments: 2100,
    engagementRate: 13.5,
    viralScore: 91,
    growthTrend: [
      { date: "May 2026", followers: 1500, views: 30000 },
      { date: "Jun 2026", followers: 4900, views: 110000 },
      { date: "Jul 2026", followers: 9800, views: 250000 }
    ],
    topPerformingContent: [
      { id: "sh1", title: "I built 5 AI newsletters in a weekend. Here is my stripe dashboard.", views: 810000, likes: 62000, date: "5 days ago" },
      { id: "sh2", title: "Stop dropshipping. Try this micro-service business instead.", views: 420000, likes: 31000, date: "1 week ago" }
    ],
    recentUploads: [
      { id: "sh1", title: "I built 5 AI newsletters in a weekend. Here is my stripe dashboard.", views: 810000, date: "5 days ago" },
      { id: "sh2", title: "Stop dropshipping. Try this micro-service business instead.", views: 420000, date: "1 week ago" },
      { id: "sh3", title: "Reviewing a $3,000/mo print-on-demand side hustle", views: 210000, date: "2 weeks ago" }
    ],
    mainKeywords: ["Side Hustle", "Stripe Dash", "Remote Jobs", "Solopreneur", "Finance"],
    hashtags: ["#sidehustle", "#remotejobs", "#makemoneyonline", "#passiveincome", "#financialfreedom"],
    category: "Finance & Business",
    postingSchedule: "3 times a week",
    estimatedAudienceCountries: ["United States", "Canada", "United Kingdom", "Philippines"],
    estimatedAudienceLanguage: "English",
    accountAgeMonths: 2,
    uploadFrequencyWeeks: 3.1
  },
  {
    id: "tw-speedrunsage",
    name: "SpeedrunSage",
    profileImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&h=150&q=80",
    platform: "twitch",
    description: "Speedrunning classic and emerging indie roguelikes with live analytical state overlays and interactive viewers challenges.",
    followers: 11200,
    totalVideos: 40,
    averageViews: 45000,
    averageLikes: 3200,
    averageComments: 2100,
    engagementRate: 18.8,
    viralScore: 92,
    growthTrend: [
      { date: "May 2026", followers: 3200, views: 15000 },
      { date: "Jun 2026", followers: 6900, views: 28000 },
      { date: "Jul 2026", followers: 11200, views: 45000 }
    ],
    topPerformingContent: [
      { id: "tg1", title: "Hades II Speedrun World Record Attempt #41 (Gained 4k followers)", views: 120000, likes: 9500, date: "3 days ago" },
      { id: "tg2", title: "Sub-15m Roguelike Speedrun live coach", views: 82000, likes: 6100, date: "1 week ago" }
    ],
    recentUploads: [
      { id: "tg1", title: "Hades II Speedrun World Record Attempt #41 (Gained 4k followers)", views: 120000, date: "3 days ago" },
      { id: "tg2", title: "Sub-15m Roguelike Speedrun live coach", views: 82000, date: "1 week ago" },
      { id: "tg3", title: "Speedrunning Celeste with raw blindfold", views: 49000, date: "2 weeks ago" }
    ],
    mainKeywords: ["Speedrun", "Hades 2", "Roguelike", "Celeste", "Gaming"],
    hashtags: ["#speedrun", "#twitchgaming", "#hades2", "#indiegames", "#roguelike"],
    category: "Gaming",
    postingSchedule: "Every day 8 PM EST",
    estimatedAudienceCountries: ["United States", "Japan", "South Korea", "France"],
    estimatedAudienceLanguage: "English",
    accountAgeMonths: 4,
    uploadFrequencyWeeks: 5.5
  }
];

let customCreators = [...INITIAL_CREATORS];

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return geminiClient;
}

// REST API Endpoints

// 1. Search emerging creators with parameters
app.get("/api/scout/search", (req, res) => {
  const {
    keyword,
    platform,
    category,
    language,
    country,
    maxFollowers,
    minViews,
    minEngagement,
    minViralScore
  } = req.query;

  let results = [...customCreators];

  if (keyword) {
    const kw = String(keyword).toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(kw) ||
      c.description.toLowerCase().includes(kw) ||
      c.mainKeywords.some(k => k.toLowerCase().includes(kw)) ||
      c.hashtags.some(h => h.toLowerCase().includes(kw)) ||
      c.category.toLowerCase().includes(kw)
    );
  }

  if (platform && platform !== "all") {
    results = results.filter(c => c.platform === String(platform).toLowerCase());
  }

  if (category && category !== "all") {
    results = results.filter(c => c.category.toLowerCase() === String(category).toLowerCase());
  }

  if (language) {
    results = results.filter(c => c.estimatedAudienceLanguage.toLowerCase().includes(String(language).toLowerCase()));
  }

  if (country) {
    results = results.filter(c => c.estimatedAudienceCountries.some(ct => ct.toLowerCase().includes(String(country).toLowerCase())));
  }

  if (maxFollowers) {
    results = results.filter(c => c.followers <= Number(maxFollowers));
  }

  if (minViews) {
    results = results.filter(c => c.averageViews >= Number(minViews));
  }

  if (minEngagement) {
    results = results.filter(c => c.engagementRate >= Number(minEngagement));
  }

  if (minViralScore) {
    results = results.filter(c => c.viralScore >= Number(minViralScore));
  }

  // If search was keyword based and we have no matching creators, we will dynamically generate one that fits!
  if (results.length === 0 && keyword) {
    const kwCap = String(keyword).charAt(0).toUpperCase() + String(keyword).slice(1);
    const mockCreated = {
      id: `gen-${Date.now()}`,
      name: `${kwCap} Labs AI`,
      profileImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=150&h=150&q=80",
      platform: platform && platform !== "all" ? String(platform) : "youtube",
      description: `Exploring revolutionary breakthroughs in ${kwCap}. Our data-driven explanations analyze real-world trends with beautiful interactive code representations.`,
      followers: 14500,
      totalVideos: 18,
      averageViews: 620000,
      averageLikes: 48000,
      averageComments: 3900,
      engagementRate: 15.2,
      viralScore: 96,
      growthTrend: [
        { date: "May 2026", followers: 2000, views: 50000 },
        { date: "Jun 2026", followers: 6500, views: 180000 },
        { date: "Jul 2026", followers: 14500, views: 620000 }
      ],
      topPerformingContent: [
        { id: "g1", title: `Solving the ${kwCap} Paradigm in 5 minutes`, views: 1100000, likes: 92000, date: "1 day ago" },
        { id: "g2", title: `The future of ${kwCap} belongs to micro-models`, views: 720000, likes: 61000, date: "4 days ago" }
      ],
      recentUploads: [
        { id: "g1", title: `Solving the ${kwCap} Paradigm in 5 minutes`, views: 1100000, date: "1 day ago" },
        { id: "g2", title: `The future of ${kwCap} belongs to micro-models`, views: 720000, date: "4 days ago" },
        { id: "g3", title: `I spent 48 hours benchmarking ${kwCap} pipelines`, views: 440000, date: "1 week ago" }
      ],
      mainKeywords: [kwCap, "AI", "Machine Learning", "Scout", "Automation"],
      hashtags: [`#${kwCap.toLowerCase()}`, "#ai", "#machinelearning", "#emergingtech"],
      category: category && category !== "all" ? String(category) : "Technology",
      postingSchedule: "Every Monday morning",
      estimatedAudienceCountries: ["United States", "Canada", "Germany", "Japan"],
      estimatedAudienceLanguage: "English",
      accountAgeMonths: 2,
      uploadFrequencyWeeks: 1.5
    };

    customCreators.push(mockCreated);
    results = [mockCreated];
  }

  res.json(results);
});

// 2. Trend Discovery Items
app.get("/api/scout/trends", (req, res) => {
  res.json({
    explodingTopics: [
      { topic: "Local Agentic Workflows", growth: "+1,420%", momentum: "High", niche: "AI & Tech", platformCount: 450 },
      { topic: "No-VC Micro SaaS Dev", growth: "+860%", momentum: "High", niche: "Finance & Business", platformCount: 190 },
      { topic: "DeepSeek R1 Fine-tuning", growth: "+3,200%", momentum: "Extreme", niche: "AI & Tech", platformCount: 1200 },
      { topic: "Interactive Roguelike Streams", growth: "+450%", momentum: "Medium", niche: "Gaming", platformCount: 220 },
      { topic: "Micro-Immersive Lang Learning", growth: "+620%", momentum: "High", niche: "Education", platformCount: 310 }
    ],
    risingNiches: [
      { niche: "Offline LLM Deployment", score: 96, topPlatform: "YouTube", representativeCount: 18 },
      { niche: "Mexico Street Food Slang", score: 94, topPlatform: "Instagram", representativeCount: 12 },
      { niche: "Bootsrap Indie SaaS Dashboards", score: 89, topPlatform: "TikTok", representativeCount: 22 },
      { niche: "Retro Console Restoration", score: 85, topPlatform: "Facebook", representativeCount: 8 }
    ],
    viralHashtags: [
      { tag: "#localllm", viewCount: "42.5M", platforms: ["tiktok", "youtube"], momentum: 96 },
      { tag: "#deepseek", viewCount: "128.4M", platforms: ["tiktok", "youtube", "instagram"], momentum: 99 },
      { tag: "#aitools", viewCount: "380.2M", platforms: ["tiktok", "instagram"], momentum: 91 },
      { tag: "#indiehackers", viewCount: "18.1M", platforms: ["x", "linkedin"], momentum: 84 },
      { tag: "#learnspanish", viewCount: "82.5M", platforms: ["instagram", "tiktok"], momentum: 95 }
    ],
    weeklyReport: {
      title: "Weekly Viral Scouting Intelligence Report",
      period: "July 7, 2026 - July 14, 2026",
      summary: "AI development and local deployment tutorials are experiencing a highly unusual organic virality event. Micro-channels (under 15k subscribers) are recording video views in the 500k to 1M range. Concurrently, conversational language pages styled with cinematic fast-cuts and real-world slang scenarios are securing high retention on Instagram Reels.",
      strategicTakeaways: [
        "Focus on local LLM runtimes (Ollama, LM Studio) content - micro-audience interest is extremely dense.",
        "Thumbnail format shifts: Minimal, terminal screenshots or pure code snippets are outperforming traditional bright faces.",
        "Interactive slang guides are replacing structured vocabulary slides in educational niches."
      ]
    }
  });
});

// 3. AI Insights (Uses Gemini 3.5 Flash or Mock Fallback)
app.post("/api/scout/insights", async (req, res) => {
  const { creatorId } = req.body;
  const creator = customCreators.find(c => c.id === creatorId);

  if (!creator) {
    return res.status(404).json({ error: "Creator not found." });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      const prompt = `
Analyze this emerging fast-growing creator for market intelligence and strategic recommendations.
Creator details:
Name: ${creator.name}
Platform: ${creator.platform}
Category: ${creator.category}
Description: ${creator.description}
Followers: ${creator.followers}
Average Views: ${creator.averageViews}
Engagement Rate: ${creator.engagementRate}%
Viral Score: ${creator.viralScore}/100
Top Performing Video/Post Titles: ${creator.topPerformingContent.map(v => `'${v.title}'`).join(", ")}
Main Keywords: ${creator.mainKeywords.join(", ")}
Hashtags: ${creator.hashtags.join(", ")}

Provide a comprehensive, high-quality, professional marketing analysis in JSON format.
Your output must be a valid JSON object matching the following TypeScript schema:
{
  "whyGrowing": string, // Explanation of their growth levers, why they stand out, and user psychological hooks.
  "viralContentTriggers": string[], // 3-4 specific triggers that make their content viral.
  "similarCreators": string[], // Names of similar rising channels or comparative archetypes.
  "futureGrowthPrediction": string, // Quantitative and qualitative forecast for the next 90 days.
  "recommendedContentIdeas": string[], // 3 highly actionable next video/post titles or ideas.
  "postingStrategy": string, // Optimized schedule, frequency, and audience retention tips.
  "bestPublishingTimes": string, // Actionable times (e.g., Wednesdays 3 PM EST).
  "seoSuggestions": string[], // List of tags, keywords, metadata tags to prioritize.
  "thumbnailRecommendations": string, // Design directions for visual thumbnails or main cover layout.
  "titleOptimizationTips": string[] // Concrete examples of title structures to test.
}
Return ONLY the JSON string. Do not wrap it in markdown code blocks like \`\`\`json.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      if (response && response.text) {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return res.json({ ...parsed, isRealAI: true });
      }
    } catch (e: any) {
      console.error("Gemini API Error, falling back to local intelligence:", e);
      // Fall through to mock logic
    }
  }

  // Graceful Fallback mock generator (Highly tailored to the specific creator!)
  const growthFactor = creator.viralScore > 90 ? "unprecedented audience retention" : "highly cohesive keyword targeting";
  const mockInsights = {
    isRealAI: false,
    whyGrowing: `The rapid rise of ${creator.name} is driven by ${growthFactor} combined with high engagement velocity on platform algorithms. In their category (${creator.category}), audiences are migrating from highly produced corporate videos to genuine, developer-centric, or authentic human-led demonstrations. Their content structure minimizes intro fluff and delivers value in the first 7 seconds, hooking high-retention viewers.`,
    viralContentTriggers: [
      "No-fluff value-driven delivery in the hook segment.",
      "Visually rich overlay graphics, live code setups, or immersive real-time slang clips.",
      "High topical urgency corresponding to massive search trend surges.",
      "Unusually high comment-to-view ratios, provoking algorithm distribution boosts."
    ],
    similarCreators: [
      "ByteSize Tech Labs",
      "The Bootstrap Nomad",
      "Hustle Engine",
      "Español Directo"
    ],
    futureGrowthPrediction: `Extrapolating current velocity, ${creator.name} is projected to grow by +150% in follower count over the next 90 days. Their average views will stabilize in the 300k range, placing them in the top 1.5% of creators in their tier before the platform pushes them fully mainstream.`,
    recommendedContentIdeas: [
      `The Ultimate ${creator.mainKeywords[0]} Cheatsheet for Beginners in 2026`,
      `How I Automated my entire ${creator.category} Workflow using 2 Free Tools`,
      `The Dark Side of ${creator.mainKeywords[1] || creator.category} (What no one is telling you)`
    ],
    postingStrategy: `Optimize engagement by publishing short hook clips (TikTok/Shorts/Reels) 2 hours before launching main long-form pieces. Actively reply to first 50 comments with open-ended questions to compound comment momentum.`,
    bestPublishingTimes: "Tuesdays & Thursdays at 2:00 PM EST (Peak workflow alignment)",
    seoSuggestions: [
      ...creator.mainKeywords,
      "low code",
      "emerging micro saas",
      "viral tech tricks",
      "2026 trends"
    ],
    thumbnailRecommendations: "High contrast dark-mode backgrounds. Avoid massive generic text. Use clean screenshots with subtle neon glow borders highlighting the exact solution.",
    titleOptimizationTips: [
      "I built a [Solution] in 30 minutes with this API",
      "Stop doing [Mistake] — do this instead",
      "The $0 way to learn [Topic]"
    ]
  };

  res.json(mockInsights);
});

// 4. Collections and Saved Creators Endpoints
app.get("/api/scout/collections", (req, res) => {
  res.json(savedCollections);
});

app.post("/api/scout/collections", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Collection name is required." });

  const newCol = {
    id: `col-${Date.now()}`,
    name,
    description,
    creators: [],
    notes: {},
    tags: {}
  };
  savedCollections.push(newCol);
  res.json(newCol);
});

app.post("/api/scout/collections/add-creator", (req, res) => {
  const { collectionId, creatorId } = req.body;
  const col = savedCollections.find(c => c.id === collectionId);
  if (!col) return res.status(404).json({ error: "Collection not found." });

  if (!col.creators.includes(creatorId)) {
    col.creators.push(creatorId);
  }
  res.json(col);
});

app.post("/api/scout/collections/remove-creator", (req, res) => {
  const { collectionId, creatorId } = req.body;
  const col = savedCollections.find(c => c.id === collectionId);
  if (!col) return res.status(404).json({ error: "Collection not found." });

  col.creators = col.creators.filter(id => id !== creatorId);
  res.json(col);
});

app.post("/api/scout/collections/notes", (req, res) => {
  const { collectionId, creatorId, note } = req.body;
  const col = savedCollections.find(c => c.id === collectionId);
  if (!col) return res.status(404).json({ error: "Collection not found." });

  col.notes[creatorId] = note;
  res.json(col);
});

app.post("/api/scout/collections/tags", (req, res) => {
  const { collectionId, creatorId, tags } = req.body;
  const col = savedCollections.find(c => c.id === collectionId);
  if (!col) return res.status(404).json({ error: "Collection not found." });

  col.tags[creatorId] = tags;
  res.json(col);
});

// 5. Smart Alerts Endpoints
app.get("/api/scout/alerts", (req, res) => {
  res.json({ alerts: smartAlerts, logs: alertLogs });
});

app.post("/api/scout/alerts", (req, res) => {
  const { name, platform, criteria } = req.body;
  if (!name || !platform) return res.status(400).json({ error: "Name and Platform are required." });

  const newAlert = {
    id: `alert-${Date.now()}`,
    name,
    platform,
    criteria: criteria || {},
    isActive: true,
    createdAt: new Date().toISOString()
  };
  smartAlerts.push(newAlert);
  res.json(newAlert);
});

app.post("/api/scout/alerts/toggle", (req, res) => {
  const { alertId } = req.body;
  const alert = smartAlerts.find(a => a.id === alertId);
  if (!alert) return res.status(404).json({ error: "Alert not found." });

  alert.isActive = !alert.isActive;
  res.json(alert);
});

app.delete("/api/scout/alerts/:id", (req, res) => {
  const { id } = req.params;
  smartAlerts = smartAlerts.filter(a => a.id !== id);
  res.json({ success: true });
});

app.post("/api/scout/alerts/mark-read", (req, res) => {
  const { logId } = req.body;
  if (logId) {
    const log = alertLogs.find(l => l.id === logId);
    if (log) log.isRead = true;
  } else {
    alertLogs.forEach(l => l.isRead = true);
  }
  res.json({ success: true, logs: alertLogs });
});

// Vite Middleware & Production Routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ViralScout AI backend listening on port ${PORT}`);
  });
}

startServer();
