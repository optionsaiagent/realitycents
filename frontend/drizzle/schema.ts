import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Short URLs for loan comparison calculator share links.
 * Stores compressed scenario data keyed by a 6-character alphanumeric code.
 */
export const shortUrls = mysqlTable("short_urls", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(),
  data: text("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShortUrl = typeof shortUrls.$inferSelect;
export type InsertShortUrl = typeof shortUrls.$inferInsert;

/**
 * Agent Toolkit — registered real estate agents.
 */
export const toolkitAgents = mysqlTable("toolkit_agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  brokerage: varchar("brokerage", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  newsletterOptIn: boolean("newsletterOptIn").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolkitAgent = typeof toolkitAgents.$inferSelect;
export type InsertToolkitAgent = typeof toolkitAgents.$inferInsert;

/**
 * Agent Toolkit — downloadable resources organized by category.
 */
export const toolkitResources = mysqlTable("toolkit_resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["buyer_handouts", "agent_scripts", "local_checklists"]),
  fileUrl: text("fileUrl").notNull(),
  downloadCount: int("downloadCount").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ToolkitResource = typeof toolkitResources.$inferSelect;
export type InsertToolkitResource = typeof toolkitResources.$inferInsert;

/**
 * Agent Toolkit — download log linking agents to resources.
 */
export const toolkitDownloads = mysqlTable("toolkit_downloads", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  resourceId: int("resourceId").notNull(),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export type ToolkitDownload = typeof toolkitDownloads.$inferSelect;
export type InsertToolkitDownload = typeof toolkitDownloads.$inferInsert;

/**
 * Agent leads — visitors who submit the /agents page email gate.
 * Deduplicated by email (upsert on conflict updates lastSeenAt).
 */
export const agentLeads = mysqlTable("agent_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentLead = typeof agentLeads.$inferSelect;
export type InsertAgentLead = typeof agentLeads.$inferInsert;