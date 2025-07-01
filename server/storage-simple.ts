import { type User, type UpsertUser } from "@shared/schema";

// Simple interface for getting started
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

// Simple in-memory storage for now
const users = new Map<string, User>();

export class MemoryStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.isAdmin || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(user.id, user);
    return user;
  }
}

export const storage = new MemoryStorage();