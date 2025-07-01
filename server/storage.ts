import {
  users,
  ssdcTranscripts,
  marketSurveyData,
  businessForms,
  aiChatSessions,
  type User,
  type UpsertUser,
  type SsdcTranscript,
  type InsertSsdcTranscript,
  type MarketSurveyData,
  type InsertMarketSurveyData,
  type BusinessForm,
  type InsertBusinessForm,
  type AiChatSession,
  type InsertAiChatSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserCount(): Promise<number>;
  
  // SSDC Transcripts
  getSsdcTranscripts(filters?: { industry?: string, search?: string }): Promise<SsdcTranscript[]>;
  getSsdcTranscript(id: number): Promise<SsdcTranscript | undefined>;
  createSsdcTranscript(transcript: InsertSsdcTranscript): Promise<SsdcTranscript>;
  updateSsdcTranscript(id: number, transcript: Partial<InsertSsdcTranscript>): Promise<SsdcTranscript>;
  deleteSsdcTranscript(id: number): Promise<void>;
  
  // Market Survey Data
  getMarketSurveyData(filters?: { industry?: string, dataType?: string }): Promise<MarketSurveyData[]>;
  getMarketSurveyDataById(id: number): Promise<MarketSurveyData | undefined>;
  createMarketSurveyData(data: InsertMarketSurveyData): Promise<MarketSurveyData>;
  updateMarketSurveyData(id: number, data: Partial<InsertMarketSurveyData>): Promise<MarketSurveyData>;
  deleteMarketSurveyData(id: number): Promise<void>;
  
  // Business Forms
  getBusinessForms(userId?: string): Promise<BusinessForm[]>;
  getBusinessForm(id: number): Promise<BusinessForm | undefined>;
  createBusinessForm(form: InsertBusinessForm): Promise<BusinessForm>;
  updateBusinessForm(id: number, form: Partial<InsertBusinessForm>): Promise<BusinessForm>;
  deleteBusinessForm(id: number): Promise<void>;
  
  // AI Chat Sessions
  getAiChatSessions(userId: string, formId?: number): Promise<AiChatSession[]>;
  getAiChatSession(id: number): Promise<AiChatSession | undefined>;
  createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession>;
  updateAiChatSession(id: number, session: Partial<InsertAiChatSession>): Promise<AiChatSession>;
  deleteAiChatSession(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return Number(result[0].count);
  }

  // SSDC Transcripts
  async getSsdcTranscripts(filters?: { industry?: string, search?: string }): Promise<SsdcTranscript[]> {
    const conditions = [];
    
    if (filters?.industry) {
      conditions.push(eq(ssdcTranscripts.industry, filters.industry));
    }
    
    if (filters?.search) {
      conditions.push(like(ssdcTranscripts.title, `%${filters.search}%`));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(ssdcTranscripts)
        .where(and(...conditions))
        .orderBy(desc(ssdcTranscripts.createdAt));
    }
    
    return await db.select().from(ssdcTranscripts)
      .orderBy(desc(ssdcTranscripts.createdAt));
  }

  async getSsdcTranscript(id: number): Promise<SsdcTranscript | undefined> {
    const [transcript] = await db.select().from(ssdcTranscripts).where(eq(ssdcTranscripts.id, id));
    return transcript;
  }

  async createSsdcTranscript(transcript: InsertSsdcTranscript): Promise<SsdcTranscript> {
    const [created] = await db.insert(ssdcTranscripts).values(transcript).returning();
    return created;
  }

  async updateSsdcTranscript(id: number, transcript: Partial<InsertSsdcTranscript>): Promise<SsdcTranscript> {
    const [updated] = await db
      .update(ssdcTranscripts)
      .set({ ...transcript, updatedAt: new Date() })
      .where(eq(ssdcTranscripts.id, id))
      .returning();
    return updated;
  }

  async deleteSsdcTranscript(id: number): Promise<void> {
    await db.delete(ssdcTranscripts).where(eq(ssdcTranscripts.id, id));
  }

  // Market Survey Data
  async getMarketSurveyData(filters?: { industry?: string, dataType?: string }): Promise<MarketSurveyData[]> {
    const conditions = [];
    if (filters?.industry) {
      conditions.push(eq(marketSurveyData.industry, filters.industry));
    }
    if (filters?.dataType) {
      conditions.push(eq(marketSurveyData.dataType, filters.dataType));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(marketSurveyData)
        .where(and(...conditions))
        .orderBy(desc(marketSurveyData.createdAt));
    }
    
    return await db.select().from(marketSurveyData)
      .orderBy(desc(marketSurveyData.createdAt));
  }

  async getMarketSurveyDataById(id: number): Promise<MarketSurveyData | undefined> {
    const [data] = await db.select().from(marketSurveyData).where(eq(marketSurveyData.id, id));
    return data;
  }

  async createMarketSurveyData(data: InsertMarketSurveyData): Promise<MarketSurveyData> {
    const [created] = await db.insert(marketSurveyData).values(data).returning();
    return created;
  }

  async updateMarketSurveyData(id: number, data: Partial<InsertMarketSurveyData>): Promise<MarketSurveyData> {
    const [updated] = await db
      .update(marketSurveyData)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(marketSurveyData.id, id))
      .returning();
    return updated;
  }

  async deleteMarketSurveyData(id: number): Promise<void> {
    await db.delete(marketSurveyData).where(eq(marketSurveyData.id, id));
  }

  // Business Forms
  async getBusinessForms(userId?: string): Promise<BusinessForm[]> {
    if (userId) {
      return await db.select().from(businessForms)
        .where(eq(businessForms.userId, userId))
        .orderBy(desc(businessForms.updatedAt));
    }
    
    return await db.select().from(businessForms)
      .orderBy(desc(businessForms.updatedAt));
  }

  async getBusinessForm(id: number): Promise<BusinessForm | undefined> {
    const [form] = await db.select().from(businessForms).where(eq(businessForms.id, id));
    return form;
  }

  async createBusinessForm(form: InsertBusinessForm): Promise<BusinessForm> {
    const [created] = await db.insert(businessForms).values(form).returning();
    return created;
  }

  async updateBusinessForm(id: number, form: Partial<InsertBusinessForm>): Promise<BusinessForm> {
    const [updated] = await db
      .update(businessForms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(businessForms.id, id))
      .returning();
    return updated;
  }

  async deleteBusinessForm(id: number): Promise<void> {
    await db.delete(businessForms).where(eq(businessForms.id, id));
  }

  // AI Chat Sessions
  async getAiChatSessions(userId: string, formId?: number): Promise<AiChatSession[]> {
    if (formId) {
      return await db.select().from(aiChatSessions)
        .where(
          and(
            eq(aiChatSessions.userId, userId),
            eq(aiChatSessions.formId, formId)
          )
        )
        .orderBy(desc(aiChatSessions.updatedAt));
    }
    
    return await db.select().from(aiChatSessions)
      .where(eq(aiChatSessions.userId, userId))
      .orderBy(desc(aiChatSessions.updatedAt));
  }

  async getAiChatSession(id: number): Promise<AiChatSession | undefined> {
    const [session] = await db.select().from(aiChatSessions).where(eq(aiChatSessions.id, id));
    return session;
  }

  async createAiChatSession(session: InsertAiChatSession): Promise<AiChatSession> {
    const [created] = await db.insert(aiChatSessions).values(session).returning();
    return created;
  }

  async updateAiChatSession(id: number, session: Partial<InsertAiChatSession>): Promise<AiChatSession> {
    const [updated] = await db
      .update(aiChatSessions)
      .set({ ...session, updatedAt: new Date() })
      .where(eq(aiChatSessions.id, id))
      .returning();
    return updated;
  }

  async deleteAiChatSession(id: number): Promise<void> {
    await db.delete(aiChatSessions).where(eq(aiChatSessions.id, id));
  }
}

export const storage = new DatabaseStorage();