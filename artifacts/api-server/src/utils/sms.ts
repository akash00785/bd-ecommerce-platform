import { logger } from "../lib/logger";

type SmsOrder = {
  orderNumber: string;
  customerPhone?: string | null;
  customerName?: string | null;
  orderStatus?: string;
  trackingId?: string | null;
};

function messageFor(order: SmsOrder, event: "new" | "status") {
  if (event === "new") {
    return `BD E-Commerce: ধন্যবাদ ${order.customerName || "customer"}। আপনার অর্ডার ${order.orderNumber} গ্রহণ করা হয়েছে।`;
  }
  const tracking = order.trackingId ? ` Tracking: ${order.trackingId}.` : "";
  return `BD E-Commerce: অর্ডার ${order.orderNumber}-এর status: ${order.orderStatus}.${tracking}`;
}

export async function sendOrderSms(order: SmsOrder, event: "new" | "status") {
  if (!order.customerPhone) return { sent: false, reason: "missing_phone" };

  const url = process.env.SMS_API_URL;
  const token = process.env.SMS_API_KEY;

  if (!url || !token) {
    // Development stub — uses the project logger instead of console so messages
    // appear in structured logs and respect log-level configuration.
    logger.info(
      { event, orderNumber: order.orderNumber, phone: order.customerPhone },
      "[sms:stub] notification queued (SMS_API_URL / SMS_API_KEY not configured)",
    );
    return { sent: false, stub: true };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ to: order.customerPhone, message: messageFor(order, event) }),
  });

  if (!response.ok) throw new Error(`SMS provider failed with ${response.status}`);
  return { sent: true };
}
