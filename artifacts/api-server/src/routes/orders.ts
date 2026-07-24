import { Router } from "express";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { db, ordersTable, productsTable, couponsTable } from "@workspace/db";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  TrackOrderParams,
} from "@workspace/api-zod";
import { bookCourierOrder } from "../utils/courier";
import { sendOrderSms } from "../utils/sms";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { logger } from "../lib/logger";

const router = Router();

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BD-${ts}-${rand}`;
}

function formatOrder(o: any) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    totalAmount: parseFloat(o.totalAmount),
    shippingFee: parseFloat(o.shippingFee),
    discountAmount: parseFloat(o.discountAmount),
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    shippingAddress: o.shippingAddress,
    items: o.items,
    couponCode: o.couponCode,
    trackingId: o.trackingId,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
  };
}

/** Sanitised view for public order tracking — removes sensitive PII */
function formatOrderPublic(o: any) {
  const addr = o.shippingAddress as Record<string, unknown> | null;
  return {
    orderNumber: o.orderNumber,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    trackingId: o.trackingId,
    createdAt: o.createdAt.toISOString(),
    // Keep only city / district from address — no street, house, or phone
    shippingCity: addr?.city ?? addr?.district ?? null,
    items: (o.items as any[]).map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      image: item.image,
    })),
  };
}

// ---------------------------------------------------------------------------
// GET /orders  — admin only
// ---------------------------------------------------------------------------
router.get("/orders", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { status, customerEmail, limit = 20, offset = 0 } = parsed.data;

  const where = status && customerEmail
    ? and(eq(ordersTable.orderStatus, status), eq(ordersTable.customerEmail, customerEmail))
    : status
      ? eq(ordersTable.orderStatus, status)
      : customerEmail
        ? eq(ordersTable.customerEmail, customerEmail)
        : undefined;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json({ orders: orders.map(formatOrder), total: Number(countResult[0]?.count ?? 0) });
});

// ---------------------------------------------------------------------------
// POST /orders  — server-side price calculation + stock validation
// requireAuth is optional; if customer is not logged in we skip UID tracking.
// We still enforce pricing server-side.
// ---------------------------------------------------------------------------
router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { items, couponCode, shippingFee: _clientShipping, totalAmount: _clientTotal, discountAmount: _clientDiscount, ...rest } = parsed.data;

  // 1. Fetch real product prices from DB
  const productIds = items.map((i: any) => i.productId as number);
  const dbProducts = await db
    .select({ id: productsTable.id, price: productsTable.price, discountPrice: productsTable.discountPrice, stock: productsTable.stock, soldOut: productsTable.soldOut, title: productsTable.title })
    .from(productsTable)
    .where(inArray(productsTable.id, productIds)) as any[];

  const productMap = new Map<number, any>(dbProducts.map((p: any) => [p.id as number, p]));

  // 2. Validate stock & build enriched items with server prices
  const enrichedItems: any[] = [];
  for (const item of items as any[]) {
    const dbProd = productMap.get(item.productId);
    if (!dbProd) {
      res.status(400).json({ error: `Product ${item.productId} not found` });
      return;
    }
    if (dbProd.soldOut || dbProd.stock < item.quantity) {
      res.status(400).json({ error: `"${dbProd.title}" এর পর্যাপ্ত স্টক নেই` });
      return;
    }
    // Use discountPrice if available, otherwise regular price
    const actualPrice = dbProd.discountPrice ? parseFloat(dbProd.discountPrice) : parseFloat(dbProd.price);
    enrichedItems.push({
      ...item,
      price: actualPrice,       // overwrite client-provided price
      title: dbProd.title,      // overwrite client-provided title for consistency
    });
  }

  // 3. Calculate subtotal server-side
  const subtotal = enrichedItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  // 4. Validate & apply coupon server-side
  let serverDiscount = 0;
  if (couponCode) {
    const couponRows = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode)).limit(1);
    const coupon = couponRows[0];
    if (coupon && coupon.active) {
      const expired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
      if (!expired) {
        const discAmt = parseFloat(coupon.discountAmount);
        if (coupon.discountType === "percentage") {
          serverDiscount = Math.round((subtotal * discAmt) / 100 * 100) / 100;
        } else {
          serverDiscount = Math.min(discAmt, subtotal);
        }
      }
    }
  }

  // 5. Shipping fee — use a server-defined rate (configurable via env, default 60 BDT)
  const serverShipping = parseFloat(process.env.SHIPPING_FEE ?? "60");

  // 6. Final total
  const serverTotal = Math.max(0, subtotal - serverDiscount + serverShipping);

  // 7. Create order in a transaction: insert order + decrement stock atomically
  const orderNumber = generateOrderNumber();

  let created: any;
  try {
    created = await db.transaction(async (tx) => {
      // Decrement stock for each item
      for (const item of enrichedItems) {
        const result = await (tx as any)
          .update(productsTable)
          .set({
            stock: sql`${productsTable.stock} - ${item.quantity}`,
            soldOut: sql`CASE WHEN ${productsTable.stock} - ${item.quantity} <= 0 THEN true ELSE false END`,
          })
          .where(and(eq(productsTable.id, item.productId), sql`${productsTable.stock} >= ${item.quantity}`))
          .returning({ id: productsTable.id }) as any[];

        if (result.length === 0) {
          throw new Error(`Concurrent stock issue for product ${item.productId}`);
        }
      }

      // Insert order with server-calculated amounts
      const [order] = await tx.insert(ordersTable).values({
        ...rest,
        orderNumber,
        items: enrichedItems,
        couponCode: couponCode ?? null,
        totalAmount: String(serverTotal),
        shippingFee: String(serverShipping),
        discountAmount: String(serverDiscount),
      }).returning();

      return order;
    });
  } catch (err: any) {
    logger.error({ err }, "Order creation failed");
    if (err.message?.includes("Concurrent stock issue")) {
      res.status(409).json({ error: "স্টক সমস্যা: একটি পণ্য ইতিমধ্যে বিক্রয় হয়ে গেছে। পুনরায় চেষ্টা করুন।" });
    } else {
      res.status(500).json({ error: "অর্ডার তৈরিতে সমস্যা হয়েছে" });
    }
    return;
  }

  void sendOrderSms(created, "new").catch((error) => logger.error({ err: error }, "[sms] new order notification failed"));
  res.status(201).json(formatOrder(created));
});

// ---------------------------------------------------------------------------
// GET /orders/track/:orderNumber  — public, PII-sanitised
// ---------------------------------------------------------------------------
router.get("/orders/track/:orderNumber", async (req, res): Promise<void> => {
  const rawNum = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;
  const parsed = TrackOrderParams.safeParse({ orderNumber: rawNum });
  if (!parsed.success) { res.status(400).json({ error: "Invalid" }); return; }

  const order = await db.select().from(ordersTable).where(eq(ordersTable.orderNumber, parsed.data.orderNumber)).limit(1);
  if (!order[0]) { res.status(404).json({ error: "Order not found" }); return; }

  // Return sanitised public view — no PII
  res.json(formatOrderPublic(order[0]));
});

// ---------------------------------------------------------------------------
// GET /orders/:id  — IDOR fix: only admin or order owner (matched by email)
// ---------------------------------------------------------------------------
router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetOrderParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const order = await db.select().from(ordersTable).where(eq(ordersTable.id, parsed.data.id)).limit(1);
  if (!order[0]) { res.status(404).json({ error: "Not found" }); return; }

  const user = (req as any).user;
  const adminUids: string[] = (process.env.ADMIN_UIDS ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const isAdmin = user?.admin === true || adminUids.includes(user?.uid);

  // If not admin, verify ownership via email
  if (!isAdmin) {
    const orderEmail = order[0].customerEmail;
    if (!orderEmail || orderEmail !== user.email) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  res.json(formatOrder(order[0]));
});

// ---------------------------------------------------------------------------
// PATCH /orders/:id/status  — admin only
// ---------------------------------------------------------------------------
router.patch("/orders/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramParsed = UpdateOrderStatusParams.safeParse({ id: parseInt(rawId, 10) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  let [updated] = await db.update(ordersTable)
    .set({ orderStatus: bodyParsed.data.orderStatus, trackingId: bodyParsed.data.trackingId ?? null })
    .where(eq(ordersTable.id, paramParsed.data.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  if (updated.orderStatus === "confirmed" && !updated.trackingId) {
    try {
      const booking = await bookCourierOrder(updated);
      [updated] = await db.update(ordersTable)
        .set({ trackingId: booking.trackingCode })
        .where(eq(ordersTable.id, updated.id))
        .returning();
      logger.info({ orderNumber: updated.orderNumber, provider: booking.provider, stub: booking.isStub }, "[courier] booking created");
    } catch (error) {
      logger.error({ err: error }, "[courier] booking failed");
    }
  }
  void sendOrderSms(updated, "status").catch((error) => logger.error({ err: error }, "[sms] status notification failed"));
  res.json(formatOrder(updated));
});

export default router;
