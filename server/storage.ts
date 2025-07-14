import {
  users,
  type User,
  type UpsertUser,
  businessIdeas, // Import the new table
  type BusinessIdea, // Import the new type
  type NewBusinessIdea, // Import the new type
  type UpdateBusinessIdea, // Import the new type
} from "../shared/schema.js";
import { db } from "./db";
import { eq, sql, desc, and, or } from "drizzle-orm"; // Added desc, and, or for potential sorting/filtering

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserCount(): Promise<number>;
  
  // New methods for Business Ideas
  createBusinessIdea(idea: NewBusinessIdea): Promise<BusinessIdea>;
  getPendingBusinessIdeas(): Promise<BusinessIdea[]>;
  getApprovedBusinessIdeas(): Promise<BusinessIdea[]>;
  getAllBusinessIdeas(): Promise<BusinessIdea[]>; // Added for admin view
  getBusinessIdeaById(id: number): Promise<BusinessIdea | undefined>;
  updateBusinessIdeaStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<BusinessIdea | undefined>;
  updateBusinessIdeaVotes(id: number, type: "upvote" | "downvote"): Promise<BusinessIdea | undefined>;
  deleteBusinessIdea(id: number): Promise<void>;
  updateBusinessIdea(id: number, data: UpdateBusinessIdea): Promise<BusinessIdea | undefined>;
}

export class DatabaseStorage implements IStorage {
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

  // New Business Idea methods
  async createBusinessIdea(ideaData: NewBusinessIdea): Promise<BusinessIdea> {
    const [newIdea] = await db.insert(businessIdeas).values(ideaData).returning();
    return newIdea;
  }

  async getPendingBusinessIdeas(): Promise<BusinessIdea[]> {
    return await db.select().from(businessIdeas).where(eq(businessIdeas.status, "pending")).orderBy(desc(businessIdeas.createdAt));
  }

  async getApprovedBusinessIdeas(): Promise<BusinessIdea[]> {
    return await db.select().from(businessIdeas).where(eq(businessIdeas.status, "approved")).orderBy(desc(businessIdeas.upvotes)); // Order by upvotes for public view
  }

  async getAllBusinessIdeas(): Promise<BusinessIdea[]> {
    return await db.select().from(businessIdeas).orderBy(desc(businessIdeas.createdAt));
  }

  async getBusinessIdeaById(id: number): Promise<BusinessIdea | undefined> {
    const [idea] = await db.select().from(businessIdeas).where(eq(businessIdeas.id, id));
    return idea;
  }

  async updateBusinessIdeaStatus(id: number, status: "pending" | "approved" | "rejected"): Promise<BusinessIdea | undefined> {
    const [updatedIdea] = await db.update(businessIdeas).set({ status, updatedAt: new Date() }).where(eq(businessIdeas.id, id)).returning();
    return updatedIdea;
  }

  async updateBusinessIdeaVotes(id: number, type: "upvote" | "downvote"): Promise<BusinessIdea | undefined> {
    const columnToUpdate = type === "upvote" ? businessIdeas.upvotes : businessIdeas.downvotes;
    const [updatedIdea] = await db.update(businessIdeas)
      .set({
        [columnToUpdate.name]: sql`${columnToUpdate} + 1`,
        updatedAt: new Date()
      })
      .where(eq(businessIdeas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteBusinessIdea(id: number): Promise<void> {
    await db.delete(businessIdeas).where(eq(businessIdeas.id, id));
  }

  async updateBusinessIdea(id: number, data: UpdateBusinessIdea): Promise<BusinessIdea | undefined> {
    const [updatedIdea] = await db.update(businessIdeas).set({ ...data, updatedAt: new Date() }).where(eq(businessIdeas.id, id)).returning();
    return updatedIdea;
  }
}

export const storage = new DatabaseStorage();