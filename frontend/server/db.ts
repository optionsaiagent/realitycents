import { eq, sql, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, shortUrls, toolkitAgents, toolkitResources, toolkitDownloads, agentLeads } from "../drizzle/schema";
import type { ToolkitAgent, ToolkitResource, AgentLead } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Short URL helpers ─────────────────────────────────────────────────────

export async function createShortUrl(code: string, data: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  await db.insert(shortUrls).values({ code, data });
}

export async function resolveShortUrl(code: string): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.select().from(shortUrls).where(eq(shortUrls.code, code)).limit(1);
  return result.length > 0 ? result[0].data : null;
}

// ─── Toolkit helpers ──────────────────────────────────────────────────────

export async function registerToolkitAgent(name: string, email: string, brokerage: string, newsletterOptIn: boolean = true): Promise<ToolkitAgent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const normalizedEmail = email.toLowerCase().trim();
  await db.insert(toolkitAgents).values({ name, email: normalizedEmail, brokerage, newsletterOptIn });
  const result = await db.select().from(toolkitAgents).where(eq(toolkitAgents.email, normalizedEmail)).limit(1);
  return result[0];
}

export async function checkToolkitAgent(email: string): Promise<ToolkitAgent | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(toolkitAgents).where(eq(toolkitAgents.email, email.toLowerCase().trim())).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getToolkitResources(): Promise<ToolkitResource[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(toolkitResources).orderBy(toolkitResources.sortOrder);
}

export async function logToolkitDownload(agentId: number, resourceId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Increment download count
  await db.update(toolkitResources)
    .set({ downloadCount: sql`${toolkitResources.downloadCount} + 1` })
    .where(eq(toolkitResources.id, resourceId));
  // Log the download
  await db.insert(toolkitDownloads).values({ agentId, resourceId });
  // Return the file URL
  const result = await db.select({ fileUrl: toolkitResources.fileUrl }).from(toolkitResources).where(eq(toolkitResources.id, resourceId)).limit(1);
  return result[0]?.fileUrl ?? '';
}

export async function updateToolkitAgent(id: number, data: { name?: string; brokerage?: string; logoUrl?: string | null; newsletterOptIn?: boolean }): Promise<ToolkitAgent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = {};
  if (data.name !== undefined) updateSet.name = data.name;
  if (data.brokerage !== undefined) updateSet.brokerage = data.brokerage;
  if (data.logoUrl !== undefined) updateSet.logoUrl = data.logoUrl;
  if (data.newsletterOptIn !== undefined) updateSet.newsletterOptIn = data.newsletterOptIn;
  if (Object.keys(updateSet).length > 0) {
    await db.update(toolkitAgents).set(updateSet).where(eq(toolkitAgents.id, id));
  }
  const result = await db.select().from(toolkitAgents).where(eq(toolkitAgents.id, id)).limit(1);
  return result[0];
}

export async function getToolkitAgentById(id: number): Promise<ToolkitAgent | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(toolkitAgents).where(eq(toolkitAgents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getToolkitAgents(): Promise<ToolkitAgent[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(toolkitAgents).orderBy(desc(toolkitAgents.createdAt));
}

export async function getToolkitDownloadStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const resources = await db.select().from(toolkitResources).orderBy(toolkitResources.sortOrder);
  const downloads = await db.select().from(toolkitDownloads);
  return { resources, downloads };
}

export async function getNewsletterSubscriberCount(): Promise<{ total: number; subscribed: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [totalRow] = await db.select({ count: count() }).from(toolkitAgents);
  const [subscribedRow] = await db
    .select({ count: count() })
    .from(toolkitAgents)
    .where(eq(toolkitAgents.newsletterOptIn, true));
  return { total: totalRow?.count ?? 0, subscribed: subscribedRow?.count ?? 0 };
}

export async function getNewsletterSubscribers(): Promise<ToolkitAgent[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(toolkitAgents)
    .where(eq(toolkitAgents.newsletterOptIn, true))
    .orderBy(desc(toolkitAgents.createdAt));
}

// ─── Agent Leads helpers ──────────────────────────────────────────────────────
/**
 * Upsert an agent lead from the /agents page email gate.
 * If the email already exists, updates name and lastSeenAt.
 * If it's new, inserts a fresh row.
 */
export async function upsertAgentLead(name: string, email: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert agent lead: database not available");
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  try {
    // Try insert first
    await db.insert(agentLeads).values({ name, email: normalizedEmail });
  } catch (_insertErr) {
    // Duplicate email — update name and let lastSeenAt auto-update via ON UPDATE
    await db
      .update(agentLeads)
      .set({ name, lastSeenAt: new Date() })
      .where(eq(agentLeads.email, normalizedEmail));
  }
}

export async function getAgentLeads(): Promise<AgentLead[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(agentLeads).orderBy(desc(agentLeads.createdAt));
}
