export interface Creator {
  id: string;
  name: string;
  profileImage: string;
  platform: string;
  description: string;
  followers: number;
  totalVideos: number;
  averageViews: number;
  averageLikes: number;
  averageComments: number;
  engagementRate: number;
  viralScore: number;
  growthTrend: Array<{ date: string; followers: number; views: number }>;
  topPerformingContent: Array<{ id: string; title: string; views: number; likes: number; date: string }>;
  recentUploads: Array<{ id: string; title: string; views: number; date: string }>;
  mainKeywords: string[];
  hashtags: string[];
  category: string;
  postingSchedule: string;
  estimatedAudienceCountries: string[];
  estimatedAudienceLanguage: string;
  accountAgeMonths?: number;
  uploadFrequencyWeeks?: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  creators: string[]; // Creator IDs
  notes: Record<string, string>; // Creator ID -> Custom Note
  tags: Record<string, string[]>; // Creator ID -> Custom Tags
}

export interface SmartAlert {
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
}

export interface AlertLog {
  id: string;
  alertId: string;
  alertName: string;
  creatorId: string;
  creatorName: string;
  platform: string;
  triggerMessage: string;
  timestamp: string;
  isRead: boolean;
}

export interface AIInsights {
  isRealAI: boolean;
  whyGrowing: string;
  viralContentTriggers: string[];
  similarCreators: string[];
  futureGrowthPrediction: string;
  recommendedContentIdeas: string[];
  postingStrategy: string;
  bestPublishingTimes: string;
  seoSuggestions: string[];
  thumbnailRecommendations: string;
  titleOptimizationTips: string[];
}
