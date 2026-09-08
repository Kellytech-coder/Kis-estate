import { Router } from "express";

import { prisma } from "../db/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/dashboard", async (_req, res, next) => {
  try {
    const [propertyCount, inquiryCount] = await Promise.all([
      prisma.property.count(),
      prisma.inquiry.count(),
    ]);
    return res.json({ data: { propertyCount, inquiryCount } });
  } catch (error) {
    return next(error);
  }
});
