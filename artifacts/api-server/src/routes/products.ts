import { Router } from "express";
import { eq, ilike, and, gte, lte, sql, desc, asc } from "drizzle-orm";
import { db, productsTable, categoriesTable, brandsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  GetRelatedProductsParams,
  ListFeaturedProductsQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth";

const router = Router();

function formatProduct(p: any, categoryName?: string | null, brandName?: string | null) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: parseFloat(p.price),
    discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
    stock: p.stock,
    soldOut: p.soldOut,
    images: p.images || [],
    categoryId: p.categoryId,
    categoryName: categoryName ?? null,
    brandId: p.brandId,
    brandName: brandName ?? null,
    sizes: p.sizes || [],
    colors: p.colors || [],
    description: p.description,
    warranty: p.warranty,
    deliveryTime: p.deliveryTime,
    returnPolicy: p.returnPolicy,
    rating: p.rating ? parseFloat(p.rating) : null,
    reviewCount: p.reviewCount,
    featured: p.featured,
    flashSale: p.flashSale,
    flashSaleEndsAt: p.flashSaleEndsAt ? p.flashSaleEndsAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  };
}

// Public: list products
router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, brand, search, minPrice, maxPrice, sort, inStock, featured, limit = 20, offset = 0 } = parsed.data;

  const conditions: any[] = [];
  if (category) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat[0]) conditions.push(eq(productsTable.categoryId, cat[0].id));
  }
  if (brand) {
    const br = await db.select().from(brandsTable).where(eq(brandsTable.slug, brand)).limit(1);
    if (br[0]) conditions.push(eq(productsTable.brandId, br[0].id));
  }
  if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
  if (minPrice != null) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (inStock) conditions.push(gte(productsTable.stock, 1));
  if (featured) conditions.push(eq(productsTable.featured, true));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy: any = desc(productsTable.createdAt);
  if (sort === "price_asc") orderBy = asc(productsTable.price);
  else if (sort === "price_desc") orderBy = desc(productsTable.price);
  else if (sort === "best_rating") orderBy = desc(productsTable.rating);

  const [products, countResult] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const catIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))];
  const brandIds = [...new Set(products.map((p) => p.brandId).filter(Boolean))];
  const [cats, brands] = await Promise.all([
    catIds.length > 0 ? db.select().from(categoriesTable).where(sql`id = ANY(${catIds}::int[])`) : Promise.resolve([]),
    brandIds.length > 0 ? db.select().from(brandsTable).where(sql`id = ANY(${brandIds}::int[])`) : Promise.resolve([]),
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const brandMap = Object.fromEntries(brands.map((b) => [b.id, b.name]));

  res.json({
    products: products.map((p) => formatProduct(p, catMap[p.categoryId ?? 0], brandMap[p.brandId ?? 0])),
    total: Number(countResult[0]?.count ?? 0),
  });
});

// Public: flash sale products
router.get("/products/flash-sale", async (_req, res): Promise<void> => {
  const now = new Date();
  const products = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.flashSale, true), gte(productsTable.flashSaleEndsAt, now)))
    .orderBy(desc(productsTable.createdAt))
    .limit(10);
  res.json(products.map((p) => formatProduct(p)));
});

// Public: featured products
router.get("/products/featured", async (req, res): Promise<void> => {
  const parsed = ListFeaturedProductsQueryParams.safeParse(req.query);
  const type = parsed.data?.type ?? "featured";

  let products;
  if (type === "featured") {
    products = await db.select().from(productsTable).where(eq(productsTable.featured, true)).limit(8);
  } else if (type === "new_arrivals") {
    products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt)).limit(8);
  } else if (type === "trending") {
    products = await db.select().from(productsTable).orderBy(desc(productsTable.reviewCount)).limit(8);
  } else {
    products = await db.select().from(productsTable).orderBy(desc(productsTable.rating)).limit(8);
  }
  res.json(products.map((p) => formatProduct(p)));
});

// Public: single product
router.get("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const product = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id)).limit(1);
  if (!product[0]) { res.status(404).json({ error: "Not found" }); return; }

  const p = product[0];
  const [cat, brand] = await Promise.all([
    p.categoryId ? db.select().from(categoriesTable).where(eq(categoriesTable.id, p.categoryId)).limit(1) : Promise.resolve([]),
    p.brandId ? db.select().from(brandsTable).where(eq(brandsTable.id, p.brandId)).limit(1) : Promise.resolve([]),
  ]);

  res.json(formatProduct(p, (cat as any)[0]?.name, (brand as any)[0]?.name));
});

// Public: related products
router.get("/products/:id/related", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetRelatedProductsParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const product = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id)).limit(1);
  if (!product[0]) { res.json([]); return; }

  const related = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.categoryId, product[0].categoryId!), sql`id != ${parsed.data.id}`))
    .limit(6);
  res.json(related.map((p) => formatProduct(p)));
});

// Admin: create product
router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { slug, price, discountPrice, ...rest } = parsed.data;
  const generatedSlug = slug ?? parsed.data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const [created] = await db.insert(productsTable).values({
    ...rest,
    slug: generatedSlug,
    price: String(price),
    discountPrice: discountPrice != null ? String(discountPrice) : null,
    flashSaleEndsAt: parsed.data.flashSaleEndsAt ? new Date(parsed.data.flashSaleEndsAt) : null,
  }).returning();

  res.status(201).json(formatProduct(created));
});

// Admin: update product
router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramParsed = UpdateProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }

  const { price, discountPrice, flashSaleEndsAt, ...rest } = bodyParsed.data;
  const updateData: any = { ...rest };
  if (price != null) updateData.price = String(price);
  if (discountPrice !== undefined) updateData.discountPrice = discountPrice != null ? String(discountPrice) : null;
  if (flashSaleEndsAt !== undefined) updateData.flashSaleEndsAt = flashSaleEndsAt ? new Date(flashSaleEndsAt) : null;

  const [updated] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, paramParsed.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatProduct(updated));
});

// Admin: delete product
router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
