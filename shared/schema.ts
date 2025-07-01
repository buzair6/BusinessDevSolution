import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SSDC Transcripts
export const ssdcTranscripts = pgTable("ssdc_transcripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  intervieweeName: text("interviewee_name").notNull(),
  intervieweeRole: text("interviewee_role").notNull(),
  intervieweeCompany: text("interviewee_company"),
  industry: text("industry").notNull(),
  duration: integer("duration"), // in minutes
  content: text("content").notNull(),
  tags: text("tags").array(),
  imageUrl: text("image_url"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market Survey Data
export const marketSurveyData = pgTable("market_survey_data", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  industry: text("industry").notNull(),
  content: text("content").notNull(),
  keyInsights: text("key_insights").array(),
  dataType: text("data_type").notNull(), // "trend", "report", "analysis"
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Business Forms
export const businessForms = pgTable("business_forms", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  industry: text("industry"),
  problemStatement: text("problem_statement"),
  targetMarket: text("target_market"),
  revenueModel: text("revenue_model"),
  competitiveAdvantage: text("competitive_advantage"),
  fundingRequirement: integer("funding_requirement"),
  status: text("status").default("draft"), // "draft", "completed", "submitted"
  aiSuggestions: jsonb("ai_suggestions"),
  formData: jsonb("form_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Chat Sessions
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  formId: integer("form_id").references(() => businessForms.id),
  messages: jsonb("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  businessForms: many(businessForms),
  aiChatSessions: many(aiChatSessions),
  marketSurveyData: many(marketSurveyData),
}));

export const businessFormsRelations = relations(businessForms, ({ one, many }) => ({
  user: one(users, {
    fields: [businessForms.userId],
    references: [users.id],
  }),
  aiChatSessions: many(aiChatSessions),
}));

export const marketSurveyDataRelations = relations(marketSurveyData, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [marketSurveyData.uploadedBy],
    references: [users.id],
  }),
}));

export const aiChatSessionsRelations = relations(aiChatSessions, ({ one }) => ({
  user: one(users, {
    fields: [aiChatSessions.userId],
    references: [users.id],
  }),
  form: one(businessForms, {
    fields: [aiChatSessions.formId],
    references: [businessForms.id],
  }),
}));

// Insert schemas
export const insertSsdcTranscriptSchema = createInsertSchema(ssdcTranscripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketSurveyDataSchema = createInsertSchema(marketSurveyData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessFormSchema = createInsertSchema(businessForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiChatSessionSchema = createInsertSchema(aiChatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type SsdcTranscript = typeof ssdcTranscripts.$inferSelect;
export type InsertSsdcTranscript = z.infer<typeof insertSsdcTranscriptSchema>;
export type MarketSurveyData = typeof marketSurveyData.$inferSelect;
export type InsertMarketSurveyData = z.infer<typeof insertMarketSurveyDataSchema>;
export type BusinessForm = typeof businessForms.$inferSelect;
export type InsertBusinessForm = z.infer<typeof insertBusinessFormSchema>;
export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAiChatSession = z.infer<typeof insertAiChatSessionSchema>;

