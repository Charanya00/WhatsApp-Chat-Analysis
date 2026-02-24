import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We won't necessarily store all chats permanently, but we might want to store analysis sessions
export const analysisSessions = pgTable("analysis_sessions", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  // We can store the computed metrics as JSONb for easy retrieval
  metrics: jsonb("metrics").notNull(),
});

export const insertSessionSchema = createInsertSchema(analysisSessions).omit({ id: true, createdAt: true });

export type AnalysisSession = typeof analysisSessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

// === Types for our analysis results ===

export interface MessageData {
  date: string; // ISO string or simple YYYY-MM-DD
  time: string; // HH:mm format
  datetime: string; // full ISO string
  sender: string;
  message: string;
  isMedia: boolean;
  isDeleted: boolean;
  sentiment?: "positive" | "negative" | "neutral";
  sentimentScore?: number;
}

export interface UserStats {
  sender: string;
  messageCount: number;
  mediaCount: number;
  deletedCount: number;
  wordCount: number;
  averageMessageLength: number;
  topEmojis: { emoji: string; count: number }[];
}

export interface TimelineData {
  date: string;
  messageCount: number;
}

export interface ActivityData {
  dayOfWeek: string;
  count: number;
}

export interface HourlyData {
  hour: number;
  count: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface EmojiFrequency {
  emoji: string;
  count: number;
}

export interface InteractionHeatmapData {
  day: string; // e.g., "Monday"
  hour: number;
  count: number;
}

export interface SentimentTrend {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface AnalysisMetrics {
  totalMessages: number;
  totalWords: number;
  totalMedia: number;
  totalDeleted: number;
  participants: string[];
  userStats: UserStats[];
  timeline: TimelineData[];
  activityByDay: ActivityData[];
  activityByMonth: ActivityData[];
  hourlyActivity: HourlyData[];
  topWords: WordFrequency[];
  topEmojis: EmojiFrequency[];
  interactionHeatmap: InteractionHeatmapData[];
  sentimentTrend: SentimentTrend[];
  // Busiest metrics
  busiestDay: { date: string; count: number };
  busiestMonth: { month: string; count: number };
  busiestHour: { hour: number; count: number };
}

// Request/Response types
export type UploadChatResponse = {
  sessionId: number;
  metrics: AnalysisMetrics;
};

export type GetSessionResponse = {
  session: AnalysisSession;
  metrics: AnalysisMetrics;
};
