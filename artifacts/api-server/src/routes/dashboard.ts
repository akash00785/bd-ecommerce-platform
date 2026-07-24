import { Router } from "express";
import { eq, sql, desc, lte } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// All dashboard endpoints are admin-only

router.get("/dashboard/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [orderStats, productStats] = await Promise.all([
    db.select({
      total: sql<number>`count(*)`,
      pending: sql<number>`count(*) filter (where order_status = 'pending')`,
      confirmed: sql<number>`count(*) filter (where order_status = 'confirmed')`,
      shipped: sql<number>`count(*) filter (where order_status = 'shipped')`,
      delivered: sql<number>`count(*) filter (where order_status = 'delivered')`,
      cancelled: sql<number>`count(*) filter (where order_status = 'cancelled')`,
      totalRevenue: sql<number>`coalesce(sum(total_amount::numeric) filter (where order_status != 'cancelled'), 0)`,
      todayRevenue: sql<number>`coalesce(sum(total_amount::numeric) filter (where order_status != 'cancelled' and created_at >= current_date), 0)`,
      todayOrders: sql<number>`count(*) filter (where created_at >= current_date)`,
    }).from(ordersTable),
    db.select({
      total: sql<number>`count(*)`,
      lowStock: sql<number>`count(*) filter (where stock <= 5 and sold_out = false)`,
    }).from(productsTable),
  ]);

  const s = orderStats[0];
  const p = productStats[0];

  res.json({
    totalRevenue: Number(s.totalRevenue),
    totalOrders: Number(s.total),
    pendingOrders: Number(s.pending),
    confirmedOrders: Number(s.confirmed),
    shippedOrders: Number(s.shipped),
    deliveredOrders: Number(s.delivered),
    cancelledOrders: Number(s.cancelled),
    totalProducts: Number(p.total),
    lowStockCount: Number(p.lowStock),
    todayRevenue: Number(s.todayRevenue),
    todayOrders: Number(s.todayOrders),
  });
});

router.get("/dashboard/recent-orders", requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(10);
  res.json(orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
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
  })));
});

router.get("/dashboard/low-stock", requireAdmin, async (_req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(lte(productsTable.stock, 5))
    .orderBy(productsTable.stock)
    .limit(20);

  res.json(products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: parseFloat(p.price),
    stock: p.stock,
    images: p.images || [],
  })));
});

router.get("/dashboard/revenue", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COALESCE(SUM(total_amount::numeric) FILTER (WHERE order_status != 'cancelled'), 0) AS revenue,
      COUNT(*) FILTER (WHERE order_status != 'cancelled') AS orders
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `);

  const BN_MONTHS: Record<string, string> = {
    '01': 'জানু', '02': 'ফেব্রু', '03': 'মার্চ', '04': 'এপ্রিল',
    '05': 'মে', '06': 'জুন', '07': 'জুলাই', '08': 'আগস্ট',
    '09': 'সেপ্টে', '10': 'অক্টো', '11': 'নভে', '12': 'ডিসে',
  };

  const data = (rows.rows as any[]).map((r: any) => ({
    name: BN_MONTHS[r.month.split('-')[1]] || r.month,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));

  res.json(data);
});

export default router;
