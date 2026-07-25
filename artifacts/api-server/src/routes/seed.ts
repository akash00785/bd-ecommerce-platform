/**
 * ONE-TIME DEMO DATA SEEDER
 * ─────────────────────────
 * POST /api/seed
 * Header: x-seed-key: <SEED_KEY>  — or query param ?key=<SEED_KEY>
 *
 * Protected by the SEED_KEY environment variable.
 * Idempotent — skips if products already exist.
 * All inserted data can be edited or deleted from the Admin Panel.
 *
 * SECURITY NOTES:
 * - Uses POST (not GET) to prevent accidental trigger by crawlers/prefetch.
 * - Uses timing-safe comparison to prevent timing-based key brute-force.
 */
import { Router } from "express";
import { timingSafeEqual, createHash } from "crypto";
import { db, productsTable, categoriesTable, brandsTable, bannersTable, couponsTable } from "@workspace/db";

const router = Router();

router.post("/seed", async (req, res): Promise<void> => {
  // ── Auth: timing-safe secret key comparison ──────────────────────────────
  const secret = process.env.SEED_KEY;
  const provided = (req.query.key ?? req.headers["x-seed-key"] ?? "") as string;

  if (!secret) {
    res.status(403).json({ error: "SEED_KEY env var is not set on the server." });
    return;
  }

  // Use timing-safe comparison to prevent timing-based brute-force attacks.
  // Normal string comparison (===) leaks info about how many characters match.
  const secretBuf = createHash("sha256").update(secret).digest();
  const providedBuf = createHash("sha256").update(provided).digest();
  if (!timingSafeEqual(secretBuf, providedBuf)) {
    res.status(403).json({ error: "Invalid seed key." });
    return;
  }

  // ── Idempotency: skip if data already exists ─────────────────────────────
  const existingProducts = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
  if (existingProducts.length > 0) {
    res.json({ message: "Database already has products. Seed skipped.", skipped: true });
    return;
  }

  // ── 1. Categories ────────────────────────────────────────────────────────
  const insertedCategories = await db
    .insert(categoriesTable)
    .values([
      {
        name: "ইলেকট্রনিক্স",
        slug: "electronics",
        image: "https://picsum.photos/seed/electronics/400/400",
      },
      {
        name: "ফ্যাশন ও পোশাক",
        slug: "fashion",
        image: "https://picsum.photos/seed/fashion/400/400",
      },
      {
        name: "হোম ও কিচেন",
        slug: "home-kitchen",
        image: "https://picsum.photos/seed/kitchen/400/400",
      },
      {
        name: "স্পোর্টস ও ফিটনেস",
        slug: "sports",
        image: "https://picsum.photos/seed/sports/400/400",
      },
    ])
    .returning();

  const catMap: Record<string, number> = {};
  insertedCategories.forEach((c) => { catMap[c.slug] = c.id; });

  // ── 2. Brands ────────────────────────────────────────────────────────────
  const insertedBrands = await db
    .insert(brandsTable)
    .values([
      {
        name: "Samsung",
        slug: "samsung",
        logo: "https://picsum.photos/seed/samsung/200/200",
      },
      {
        name: "Apple",
        slug: "apple",
        logo: "https://picsum.photos/seed/apple/200/200",
      },
      {
        name: "Walton",
        slug: "walton",
        logo: "https://picsum.photos/seed/walton/200/200",
      },
    ])
    .returning();

  const brandMap: Record<string, number> = {};
  insertedBrands.forEach((b) => { brandMap[b.slug] = b.id; });

  // ── 3. Products ──────────────────────────────────────────────────────────
  const flashSaleEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  await db.insert(productsTable).values([
    {
      title: "Samsung Galaxy A15 5G",
      slug: "samsung-galaxy-a15-5g",
      price: "18999",
      discountPrice: "15999",
      stock: 50,
      categoryId: catMap["electronics"],
      brandId: brandMap["samsung"],
      images: [
        "https://picsum.photos/seed/samsungA15/600/600",
        "https://picsum.photos/seed/samsungA15b/600/600",
      ],
      description:
        "Samsung Galaxy A15 5G — ৫জি নেটওয়ার্ক সাপোর্ট, ৬.৫ ইঞ্চি Super AMOLED ডিসপ্লে, ৫০MP ক্যামেরা ও ৫০০০mAh ব্যাটারি। প্রতিদিনের ব্যবহারের জন্য আদর্শ স্মার্টফোন।",
      deliveryTime: "৩-৫ কার্যদিবস",
      returnPolicy: "৭ দিনের রিটার্ন পলিসি",
      warranty: "১ বছর অফিসিয়াল ওয়ারেন্টি",
      rating: "4.50",
      reviewCount: 128,
      featured: true,
      flashSale: true,
      flashSaleEndsAt: flashSaleEnd,
    },
    {
      title: "Apple iPhone 15 128GB",
      slug: "apple-iphone-15-128gb",
      price: "130000",
      discountPrice: "124999",
      stock: 20,
      categoryId: catMap["electronics"],
      brandId: brandMap["apple"],
      images: [
        "https://picsum.photos/seed/iphone15/600/600",
        "https://picsum.photos/seed/iphone15b/600/600",
      ],
      description:
        "Apple iPhone 15 — Dynamic Island ডিসপ্লে, A16 Bionic চিপ, ৪৮MP মেইন ক্যামেরা। iOS-এর সর্বশেষ ফিচার উপভোগ করুন।",
      deliveryTime: "২-৩ কার্যদিবস",
      returnPolicy: "৭ দিনের রিটার্ন পলিসি",
      warranty: "১ বছর অফিসিয়াল ওয়ারেন্টি",
      rating: "4.80",
      reviewCount: 256,
      featured: true,
      flashSale: false,
    },
    {
      title: "Walton Primo NF6 ল্যাপটপ",
      slug: "walton-primo-nf6-laptop",
      price: "45000",
      discountPrice: "41999",
      stock: 15,
      categoryId: catMap["electronics"],
      brandId: brandMap["walton"],
      images: [
        "https://picsum.photos/seed/waltonlaptop/600/600",
        "https://picsum.photos/seed/waltonlaptop2/600/600",
      ],
      description:
        "Walton Primo NF6 — Intel Core i5, 8GB RAM, 512GB SSD, 15.6 ইঞ্চি FHD ডিসপ্লে। অফিস, স্টাডি ও ক্রিয়েটিভ কাজের জন্য পারফেক্ট।",
      deliveryTime: "৩-৫ কার্যদিবস",
      returnPolicy: "১৪ দিনের রিটার্ন পলিসি",
      warranty: "২ বছর ব্র্যান্ড ওয়ারেন্টি",
      rating: "4.20",
      reviewCount: 74,
      featured: true,
      flashSale: false,
    },
    {
      title: "প্রিমিয়াম কটন পাঞ্জাবি সেট",
      slug: "premium-cotton-punjabi-set",
      price: "1800",
      discountPrice: "1299",
      stock: 100,
      categoryId: catMap["fashion"],
      brandId: null,
      images: [
        "https://picsum.photos/seed/punjabi1/600/600",
        "https://picsum.photos/seed/punjabi2/600/600",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["সাদা", "নীল", "ধূসর", "কালো"],
      description:
        "১০০% খাঁটি কটন পাঞ্জাবি — হালকা, আরামদায়ক ও টেকসই। ঈদ, পূজা বা যেকোনো উৎসবে পরার জন্য আদর্শ।",
      deliveryTime: "২-৪ কার্যদিবস",
      returnPolicy: "৭ দিনের রিটার্ন পলিসি",
      warranty: null,
      rating: "4.60",
      reviewCount: 312,
      featured: true,
      flashSale: true,
      flashSaleEndsAt: flashSaleEnd,
    },
    {
      title: "Walton 43 ইঞ্চি Smart LED TV",
      slug: "walton-43-smart-led-tv",
      price: "32000",
      discountPrice: "27999",
      stock: 30,
      categoryId: catMap["electronics"],
      brandId: brandMap["walton"],
      images: [
        "https://picsum.photos/seed/smarttv/600/600",
        "https://picsum.photos/seed/smarttv2/600/600",
      ],
      description:
        "Walton 43\" Smart TV — 4K Ultra HD, Android OS, WiFi, Bluetooth, YouTube ও Netflix সাপোর্ট। বাড়িকে সিনেমা হলে পরিণত করুন।",
      deliveryTime: "৫-৭ কার্যদিবস",
      returnPolicy: "৭ দিনের রিটার্ন পলিসি",
      warranty: "২ বছর ওয়ারেন্টি",
      rating: "4.30",
      reviewCount: 89,
      featured: false,
      flashSale: false,
    },
    {
      title: "স্পোর্টস রানিং শুজ",
      slug: "sports-running-shoes",
      price: "2500",
      discountPrice: "1899",
      stock: 80,
      categoryId: catMap["sports"],
      brandId: null,
      images: [
        "https://picsum.photos/seed/shoes1/600/600",
        "https://picsum.photos/seed/shoes2/600/600",
      ],
      sizes: ["৩৮", "৩৯", "৪০", "৪১", "৪২", "৪৩", "৪৪"],
      colors: ["কালো", "সাদা", "লাল"],
      description:
        "লাইটওয়েট ও ব্রিদেবল স্পোর্টস শুজ — দৌড়, জিম বা হাইকিং-এর জন্য পারফেক্ট। EVA সোল, নন-স্লিপ গ্রিপ।",
      deliveryTime: "২-৪ কার্যদিবস",
      returnPolicy: "৭ দিনের রিটার্ন পলিসি",
      warranty: null,
      rating: "4.10",
      reviewCount: 203,
      featured: false,
      flashSale: false,
    },
  ]);

  // ── 4. Banners ───────────────────────────────────────────────────────────
  await db.insert(bannersTable).values([
    {
      title: "ঈদ স্পেশাল সেল — সর্বোচ্চ ৫০% ছাড়!",
      imageUrl: "https://picsum.photos/seed/banner-eid/1200/450",
      link: "/shop",
      active: true,
    },
    {
      title: "নতুন ইলেকট্রনিক্স কালেকশন এসে গেছে",
      imageUrl: "https://picsum.photos/seed/banner-tech/1200/450",
      link: "/shop?category=electronics",
      active: true,
    },
  ]);

  // ── 5. Coupons ───────────────────────────────────────────────────────────
  await db.insert(couponsTable).values([
    {
      code: "DEMO10",
      discountType: "percentage",
      discountAmount: "10",
      minOrderAmount: "500",
      expiryDate: "2026-12-31",
      active: true,
    },
    {
      code: "SAVE200",
      discountType: "fixed",
      discountAmount: "200",
      minOrderAmount: "1500",
      expiryDate: "2026-12-31",
      active: true,
    },
  ]);

  res.status(201).json({
    message: "✅ ডেমো ডেটা সফলভাবে যোগ হয়েছে!",
    seeded: {
      categories: insertedCategories.length,
      brands: insertedBrands.length,
      products: 6,
      banners: 2,
      coupons: 2,
    },
  });
});

export default router;
