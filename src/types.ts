export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  mood?: string;
  topics?: string[];
  insights?: string;
  actionItems?: string[];
  reflectionQuestion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalMessage {
  id: string;
  journalId: string;
  userId: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface ReflectionSummaryData {
  title: string;
  summary: string;
  mood: string;
  topics: string[];
  insights: string;
  actionItems: string[];
  reflectionQuestion: string;
}

export interface ReflectionAnalysis {
  recurringThemes: Array<{
    theme: string;
    description: string;
    trend: "expanding" | "stable" | "resolving" | string;
  }>;
  moodDistribution: Array<{
    mood: string;
    countOrPercent: string;
    insight: string;
  }>;
  repeatedConcerns: Array<{
    concern: string;
    observation: string;
    constructiveReframing: string;
  }>;
  breakthroughInsights: Array<{
    title: string;
    insight: string;
  }>;
  suggestedActions: Array<{
    action: string;
    timeframe: string;
    whyItMatters: string;
  }>;
  personalReflectionQuestions: string[];
  growthNarrative: string;
}

export type ViewTab = "active" | "history" | "reflection" | "security";
