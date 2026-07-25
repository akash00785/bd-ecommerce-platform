import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import brandsRouter from "./brands.js";
import ordersRouter from "./orders.js";
import bannersRouter from "./banners.js";
import settingsRouter from "./settings.js";
import couponsRouter from "./coupons.js";
import dashboardRouter from "./dashboard.js";
import reviewsRouter from "./reviews.js";
import newsletterRouter from "./newsletter.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(ordersRouter);
router.use(bannersRouter);
router.use(settingsRouter);
router.use(couponsRouter);
router.use(dashboardRouter);
router.use(reviewsRouter);
router.use(newsletterRouter);

export default router;
