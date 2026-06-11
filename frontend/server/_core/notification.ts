// Stub for type inference only (frontend build)
export type NotificationPayload = { title: string; content: string };
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  return true;
}
