import { db } from "./db";
import {
  analysisSessions,
  type AnalysisSession,
  type InsertSession,
  type AnalysisMetrics
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createSession(session: InsertSession & { metrics: AnalysisMetrics }): Promise<AnalysisSession>;
  getSession(id: number): Promise<AnalysisSession | undefined>;
  getRecentSessions(): Promise<AnalysisSession[]>;
}

export class DatabaseStorage implements IStorage {
  async createSession(session: InsertSession & { metrics: AnalysisMetrics }): Promise<AnalysisSession> {
    const [created] = await db.insert(analysisSessions)
      .values({
        filename: session.filename,
        metrics: session.metrics as any // jsonb mapping
      })
      .returning();
    return created;
  }

  async getSession(id: number): Promise<AnalysisSession | undefined> {
    const [session] = await db.select()
      .from(analysisSessions)
      .where(eq(analysisSessions.id, id));
    return session;
  }

  async getRecentSessions(): Promise<AnalysisSession[]> {
    return await db.select()
      .from(analysisSessions)
      .orderBy(desc(analysisSessions.createdAt))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
