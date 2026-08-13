/**
 * Owner notifications — lead alerts for contact form, guide signups, and
 * agent registrations. Delivered by email via Resend (replaces the Manus
 * notification service).
 */
import { TRPCError } from "@trpc/server";
import { sendOwnerNotificationEmail } from "../email";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  return {
    title: input.title.trim().slice(0, TITLE_MAX_LENGTH),
    content: input.content.trim().slice(0, CONTENT_MAX_LENGTH),
  };
};

/**
 * Send a notification to the site owner. Returns true when delivered.
 */
export async function notifyOwner(input: NotificationPayload): Promise<boolean> {
  const payload = validatePayload(input);
  const result = await sendOwnerNotificationEmail(payload);
  return result.success;
}
