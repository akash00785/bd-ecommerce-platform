import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, newsletterTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// RFC 5321 max email length is 254 characters
const MAX_EMAIL_LENGTH = 254;
// Stricter email regex: local@domain.tld — rejects unicode tricks and bare TLDs
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// Public: subscribe
router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const emailStr = typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (
    !emailStr ||
    emailStr.length > MAX_EMAIL_LENGTH ||
    !EMAIL_REGEX.test(emailStr)
  ) {
    res.status(400).json({ error: "সঠিক ইমেইল দিন" });
    return;
  }

  const existing = await db.select().from(newsletterTable).where(eq(newsletterTable.email, emailStr));
  if (existing.length > 0) {
    if (existing[0].isActive) {
      res.status(200).json({ message: "আপনি আগে থেকেই সাবস্ক্রাইব করা আছেন" });
    } else {
      await db.update(newsletterTable).set({ isActive: true }).where(eq(newsletterTable.email, emailStr));
      res.status(200).json({ message: "সাবস্ক্রিপশন পুনরায় সক্রিয় হয়েছে!" });
    }
    return;
  }

  await db.insert(newsletterTable).values({ email: emailStr, isActive: true });
  res.status(201).json({ message: "সফলভাবে সাবস্ক্রাইব করা হয়েছে!" });
});

// Admin: list subscribers
router.get("/newsletter/subscribers", requireAdmin, async (_req, res): Promise<void> => {
  const subscribers = await db
    .select()
    .from(newsletterTable)
    .where(eq(newsletterTable.isActive, true))
    .orderBy(desc(newsletterTable.subscribedAt));

  res.json({
    total: subscribers.length,
    subscribers: subscribers.map(s => ({ id: s.id, email: s.email, subscribedAt: s.subscribedAt.toISOString() })),
  });
});

export default router;
