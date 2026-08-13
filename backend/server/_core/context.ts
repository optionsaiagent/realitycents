import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getUserFromRequest } from "./session";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Authentication is optional; public procedures run with user = null.
  const user = await getUserFromRequest(opts.req);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
