import "dotenv/config";

import argon2 from "argon2";
import { PrismaClient, UserRole } from "@prisma/client";
import { z } from "zod";

const seedEnv = z.object({
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(100),
  INITIAL_ADMIN_EMAIL: z.string().trim().email().transform((value) => value.toLowerCase()),
  INITIAL_ADMIN_PASSWORD: z.string().min(12).max(1024),
}).parse(process.env);

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash(seedEnv.INITIAL_ADMIN_PASSWORD, { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: seedEnv.INITIAL_ADMIN_EMAIL },
    update: { name: seedEnv.INITIAL_ADMIN_NAME, passwordHash, role: UserRole.ADMIN, isActive: true },
    create: {
      name: seedEnv.INITIAL_ADMIN_NAME,
      email: seedEnv.INITIAL_ADMIN_EMAIL,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log("Initial administrator has been seeded.");
}

main().finally(async () => prisma.$disconnect());
