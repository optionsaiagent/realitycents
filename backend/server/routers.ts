import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createShortUrl,
  resolveShortUrl,
  registerToolkitAgent,
  checkToolkitAgent,
  getToolkitResources,
  logToolkitDownload,
  getToolkitAgents,
  getToolkitDownloadStats,
  updateToolkitAgent,
  getToolkitAgentById,
  getNewsletterSubscriberCount,
  getNewsletterSubscribers,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { brandPdf } from "./pdfBranding";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  shortUrl: router({
    create: publicProcedure
      .input(z.object({ data: z.string().min(1).max(100000) }))
      .mutation(async ({ input }) => {
        const code = nanoid(6);
        await createShortUrl(code, input.data);
        return { code };
      }),
    resolve: publicProcedure
      .input(z.object({ code: z.string().length(6) }))
      .query(async ({ input }) => {
        const data = await resolveShortUrl(input.code);
        if (!data) throw new Error("Short URL not found");
        return { data };
      }),
  }),

  toolkit: router({
    /** Register a new agent. Throws if email already exists. */
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          email: z.string().email().max(320),
          brokerage: z.string().min(1).max(255),
          newsletterOptIn: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        const existing = await checkToolkitAgent(input.email);
        if (existing) {
          return { agent: existing, isNew: false };
        }
        const agent = await registerToolkitAgent(input.name, input.email, input.brokerage, input.newsletterOptIn);
        // Notify owner of new agent registration (fire-and-forget)
        notifyOwner({
          title: `New Agent Toolkit Registration: ${input.name}`,
          content: `**${input.name}** from **${input.brokerage}** just registered for the Agent Toolkit.\n\n- **Email:** ${input.email}\n- **Newsletter:** ${input.newsletterOptIn ? 'Subscribed ✓' : 'Opted out'}`,
        }).catch(err => console.error('[Notification] Failed to notify owner:', err));
        return { agent, isNew: true };
      }),

    /** Check if an email is already registered. Returns agent or null. */
    checkAgent: publicProcedure
      .input(z.object({ email: z.string().email().max(320) }))
      .query(async ({ input }) => {
        const agent = await checkToolkitAgent(input.email);
        return { agent };
      }),

    /** Update agent profile (name, brokerage, newsletterOptIn). */
    updateProfile: publicProcedure
      .input(
        z.object({
          agentId: z.number().int().positive(),
          name: z.string().min(1).max(255).optional(),
          brokerage: z.string().min(1).max(255).optional(),
          newsletterOptIn: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { agentId, ...data } = input;
        const agent = await updateToolkitAgent(agentId, data);
        return { agent };
      }),

    /** Upload agent logo. Accepts base64-encoded image data. */
    uploadLogo: publicProcedure
      .input(
        z.object({
          agentId: z.number().int().positive(),
          imageBase64: z.string().min(1),
          mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
          fileName: z.string().min(1).max(255),
        })
      )
      .mutation(async ({ input }) => {
        const { agentId, imageBase64, mimeType, fileName } = input;
        // Decode base64 to buffer
        const buffer = Buffer.from(imageBase64, "base64");
        // Upload to S3 with a unique key
        const ext = fileName.split(".").pop() || "png";
        const key = `toolkit-logos/agent-${agentId}-${nanoid(8)}.${ext}`;
        const { url } = await storagePut(key, buffer, mimeType);
        // Update agent record with logo URL
        const agent = await updateToolkitAgent(agentId, { logoUrl: url });
        return { agent, logoUrl: url };
      }),

    /** Remove agent logo. */
    removeLogo: publicProcedure
      .input(z.object({ agentId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        const agent = await updateToolkitAgent(input.agentId, { logoUrl: null });
        return { agent };
      }),

    /** List all resources grouped by category. */
    getResources: publicProcedure.query(async () => {
      const resources = await getToolkitResources();
      const grouped = {
        buyer_handouts: resources.filter(r => r.category === "buyer_handouts"),
        agent_scripts: resources.filter(r => r.category === "agent_scripts"),
        local_checklists: resources.filter(r => r.category === "local_checklists"),
      };
      return { resources, grouped };
    }),

    /** Download resource with branding applied. */
    downloadResource: publicProcedure
      .input(
        z.object({
          agentId: z.number().int().positive(),
          resourceId: z.number().int().positive(),
        })
      )
      .mutation(async ({ input }) => {
        // Log the download and get file URL
        const fileUrl = await logToolkitDownload(input.agentId, input.resourceId);
        // Get agent info for branding
        const agent = await getToolkitAgentById(input.agentId);
        if (!agent) {
          return { fileUrl, branded: false };
        }
        // Try to brand the PDF
        try {
          const brandedBytes = await brandPdf({
            pdfUrl: fileUrl,
            agentName: agent.name,
            brokerage: agent.brokerage,
            logoUrl: agent.logoUrl,
          });
          // Upload branded PDF to S3 with a unique key
          const brandedKey = `toolkit-branded/agent-${agent.id}-res-${input.resourceId}-${nanoid(6)}.pdf`;
          const { url: brandedUrl } = await storagePut(brandedKey, brandedBytes, "application/pdf");
          return { fileUrl: brandedUrl, branded: true };
        } catch (e) {
          console.error("PDF branding failed, returning original:", e);
          return { fileUrl, branded: false };
        }
      }),

    /** Admin: list all registered agents. Password-protected. */
    adminGetAgents: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== "cmg2026") throw new Error("Unauthorized");
        const agents = await getToolkitAgents();
        return { agents };
      }),

    /** Admin: get download stats per resource. Password-protected. */
    adminGetStats: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== "cmg2026") throw new Error("Unauthorized");
        const stats = await getToolkitDownloadStats();
        return stats;
      }),

    /** Admin: get newsletter subscriber count. Password-protected. */
    adminGetNewsletterStats: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== "cmg2026") throw new Error("Unauthorized");
        return getNewsletterSubscriberCount();
      }),

    /** Admin: export newsletter subscribers as CSV data. Password-protected. */
    adminExportCsv: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        if (input.password !== "cmg2026") throw new Error("Unauthorized");
        const agents = await getNewsletterSubscribers();
        const rows = agents.map(a => ({
          name: a.name,
          email: a.email,
          brokerage: a.brokerage,
          registeredAt: a.createdAt instanceof Date
            ? a.createdAt.toISOString().split('T')[0]
            : String(a.createdAt).split('T')[0],
          newsletter: a.newsletterOptIn ? 'Yes' : 'No',
        }));
        return { rows };
      }),
  }),
});

export type AppRouter = typeof appRouter;
