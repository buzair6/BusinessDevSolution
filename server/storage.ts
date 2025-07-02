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

// Seeding function for development
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTranscripts = await db.select().from(ssdcTranscripts).limit(1);
    const existingMarketData = await db.select().from(marketSurveyData).limit(1);
    
    if (existingTranscripts.length === 0) {
      console.log("Seeding SSDC transcripts...");
      await db.insert(ssdcTranscripts).values([
        {
          title: "Scaling Tech Startups in 2024",
          intervieweeName: "Sarah Chen",
          intervieweeRole: "CEO",
          intervieweeCompany: "TechFlow Solutions",
          industry: "Technology",
          duration: 45,
          content: "In today's rapidly evolving tech landscape, the key to scaling a startup successfully lies in three fundamental areas: product-market fit validation, strategic hiring, and maintaining operational efficiency. We've learned that premature scaling can be detrimental. At TechFlow, we focused on deeply understanding our customers' pain points before expanding our team or product features. The biggest mistake I see founders make is trying to scale before they have clear metrics showing consistent growth and customer satisfaction. Technology should solve real problems, not create fancy solutions looking for problems to solve.",
          tags: ["scaling", "startup", "product-market-fit", "tech"],
          imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
          profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
        },
        {
          title: "Building Sustainable Healthcare Solutions",
          intervieweeName: "Dr. Michael Rodriguez",
          intervieweeRole: "Founder & CEO",
          intervieweeCompany: "HealthTech Innovations",
          industry: "Healthcare",
          duration: 52,
          content: "The healthcare industry is ripe for disruption, but innovation must be approached with extreme care and regulatory awareness. Our journey at HealthTech Innovations taught us that the most successful healthcare startups focus on improving patient outcomes while reducing costs. We developed our telemedicine platform by first understanding the regulatory landscape, then building strong partnerships with healthcare providers. The key insight is that technology alone isn't enough - you need to understand the complex ecosystem of healthcare delivery, insurance, and patient care.",
          tags: ["healthcare", "telemedicine", "regulation", "patient-outcomes"],
          imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
          profileImageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
        },
        {
          title: "E-commerce Evolution and Customer Experience",
          intervieweeName: "Emma Johnson",
          intervieweeRole: "CEO",
          intervieweeCompany: "RetailNext",
          industry: "E-commerce",
          duration: 38,
          content: "E-commerce has evolved far beyond just putting products online. Today's successful e-commerce businesses are focused on creating seamless, personalized customer experiences across all touchpoints. At RetailNext, we've learned that data-driven personalization, fast delivery, and exceptional customer service are non-negotiable. The future of e-commerce lies in understanding customer behavior patterns and predicting their needs before they even realize them. Social commerce and sustainability are becoming increasingly important factors in purchase decisions.",
          tags: ["ecommerce", "customer-experience", "personalization", "data-driven"],
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&w=800&h=600&fit=crop",
          profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face"
        }
      ]);
    }

    if (existingMarketData.length === 0) {
      console.log("Seeding market survey data...");
      await db.insert(marketSurveyData).values([
        {
          title: "Global AI Market Trends 2024",
          source: "TechMarket Research",
          industry: "Technology",
          content: "The global artificial intelligence market is projected to reach $1.8 trillion by 2030, with a compound annual growth rate of 37.3%. Key growth drivers include increasing adoption of AI in healthcare, finance, and manufacturing sectors. Generative AI represents the fastest-growing segment, with enterprise adoption increasing by 156% year-over-year. Major challenges include data privacy concerns, regulatory compliance, and the need for skilled AI professionals.",
          keyInsights: ["AI market to reach $1.8T by 2030", "37.3% CAGR expected", "Generative AI shows 156% YoY growth", "Healthcare and finance lead adoption"],
          dataType: "trend",
        },
        {
          title: "Sustainable Business Practices Survey",
          source: "Green Business Institute",
          industry: "Manufacturing",
          content: "A comprehensive survey of 2,500 businesses reveals that 78% of companies are implementing sustainable practices to meet consumer demand and regulatory requirements. Companies investing in sustainability report 23% higher employee satisfaction and 19% improvement in brand perception. The biggest barriers to sustainability adoption are initial implementation costs (67%) and lack of clear ROI metrics (54%).",
          keyInsights: ["78% of companies implementing sustainability", "23% higher employee satisfaction", "67% cite cost as barrier", "19% improvement in brand perception"],
          dataType: "survey",
        },
        {
          title: "Remote Work Impact on Productivity",
          source: "Future of Work Research Center",
          industry: "Technology",
          content: "Analysis of productivity metrics from 1,200 companies shows that remote work has led to a 13% increase in overall productivity. However, creative collaboration has decreased by 8%, and employee burnout has increased by 11%. Companies with strong digital infrastructure and communication tools show 31% better remote work outcomes compared to those with traditional setups.",
          keyInsights: ["13% productivity increase overall", "8% decrease in creative collaboration", "11% increase in burnout", "Digital infrastructure crucial for success"],
          dataType: "analysis",
        }
      ]);
    }

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}