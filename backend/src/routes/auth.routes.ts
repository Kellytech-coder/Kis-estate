import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import argon2 from "argon2";
import { z } from "zod";

import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { createAccessToken, hashToken, newOpaqueToken } from "../lib/token.js";
import { requireAuth } from "../middleware/auth.js";

const loginSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(1024),
});

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

export const authRouter = Router();

authRouter.post(
  "/login",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.isActive || user.role !== "ADMIN") {
        throw new HttpError(401, "Invalid administrator email or password.");
      }

      const passwordMatches = await argon2.verify(user.passwordHash, password);
      if (!passwordMatches) throw new HttpError(401, "Invalid administrator email or password.");

      const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
      const session = await prisma.session.create({
        data: { userId: user.id, tokenHash: hashToken(newOpaqueToken()), expiresAt },
      });
      const accessToken = createAccessToken({ sub: user.id, sid: session.id, role: user.role });

      res.cookie("access_token", accessToken, cookieOptions);
      return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      return next(error);
    }
  },
);

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await prisma.session.delete({ where: { id: req.auth!.sessionId } });
    res.clearCookie("access_token", { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});
