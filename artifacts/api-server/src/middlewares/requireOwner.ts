import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireOwner: RequestHandler = (req, res, next) => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  res.locals.userId = userId;
  next();
};

export function getOwnerId(res: { locals: Record<string, unknown> }): string {
  const userId = res.locals.userId;
  if (typeof userId !== "string" || userId.length === 0) {
    throw new Error("Authenticated owner ID is missing from request context");
  }
  return userId;
}
