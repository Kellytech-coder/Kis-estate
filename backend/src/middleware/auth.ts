import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";

import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken } from "../lib/token.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies.access_token;
    if (typeof token !== "string") {
      throw new HttpError(401, "Authentication is required.");
    }

    const payload = verifyAccessToken(token);
    const session = await prisma.session.findFirst({
      where: { id: payload.sid, userId: payload.sub, expiresAt: { gt: new Date() } },
      include: { user: { select: { role: true, isActive: true } } },
    });

    if (!session || !session.user.isActive) {
      throw new HttpError(401, "Your session is no longer valid.");
    }

    req.auth = { userId: payload.sub, sessionId: session.id, role: session.user.role };
    next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    return next(new HttpError(401, "Invalid or expired authentication session."));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new HttpError(401, "Authentication is required."));
  if (req.auth.role !== UserRole.ADMIN) {
    return next(new HttpError(403, "Administrator access is required."));
  }
  return next();
}
