type CourierOrder = {
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  totalAmount: string | number;
  shippingAddress: unknown;
  items: unknown;
};

type CourierResult = {
  provider: "steadfast" | "pathao";
  trackingCode: string;
  isStub: boolean;
};

function stubTrackingCode(provider: "steadfast" | "pathao", orderNumber: string) {
  return `${provider.toUpperCase()}-${orderNumber.replace(/[^A-Z0-9]/gi, "").slice(-12)}`;
}

async function requestCourier(
  provider: "steadfast" | "pathao",
  url: string,
  token: string,
  order: CourierOrder,
): Promise<CourierResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      invoice: order.orderNumber,
      recipient_name: order.customerName,
      recipient_phone: order.customerPhone,
      recipient_address: order.shippingAddress,
      amount: Number(order.totalAmount),
      items: order.items,
    }),
  });
  if (!response.ok) throw new Error(`${provider} booking failed with ${response.status}`);
  const data = await response.json() as Record<string, any>;
  const trackingCode = data.trackingCode ?? data.tracking_code ?? data.consignment_id ?? data.data?.tracking_code;
  if (!trackingCode) throw new Error(`${provider} returned no tracking code`);
  return { provider, trackingCode: String(trackingCode), isStub: false };
}

export async function bookCourierOrder(order: CourierOrder): Promise<CourierResult> {
  const provider = (process.env.COURIER_PROVIDER || "steadfast").toLowerCase() === "pathao" ? "pathao" : "steadfast";
  const token = provider === "pathao" ? process.env.PATHAO_API_KEY : process.env.STEADFAST_API_KEY;
  const url = provider === "pathao" ? process.env.PATHAO_BOOKING_URL : process.env.STEADFAST_BOOKING_URL;

  if (token && url) return requestCourier(provider, url, token, order);

  // Safe development fallback: keeps the order flow testable without courier credentials.
  return { provider, trackingCode: stubTrackingCode(provider, order.orderNumber), isStub: true };
}