import { Router } from "express";

import { prisma } from "../db/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: "ok", database: "connected" });
  } catch {
    return res.status(503).json({ status: "degraded", database: "unavailable" });
  }
});
