import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { withTimezone: true }).notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  password: text("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New Business Ideas table
export const businessIdeas = pgTable(
  "business_ideas",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(() => users.id),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
    upvotes: integer("upvotes").default(0).notNull(),
    downvotes: integer("downvotes").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Added .notNull()
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Added .notNull()
  },
  (table) => ({
    statusIdx: index("IDX_business_ideas_status").on(table.status),
    userIdIdx: index("IDX_business_ideas_user_id").on(table.userId),
  })
);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// New Business Idea Types for Zod validation and Drizzle inference
export const insertBusinessIdeaSchema = createInsertSchema(businessIdeas, {
  userId: z.string().uuid(),
  title: z.string().min(5, "Title must be at least 5 characters.").max(256, "Title cannot exceed 256 characters."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  status: z.enum(["pending", "approved", "rejected"]).default("pending").optional(),
});

// Schema for updating an idea (all fields optional for partial update)
export const updateBusinessIdeaSchema = createInsertSchema(businessIdeas).pick({
  title: true,
  description: true,
  status: true,
}).partial();


export type BusinessIdea = typeof businessIdeas.$inferSelect;
export type NewBusinessIdea = typeof insertBusinessIdeaSchema._type;
export type UpdateBusinessIdea = z.infer<typeof updateBusinessIdeaSchema>;