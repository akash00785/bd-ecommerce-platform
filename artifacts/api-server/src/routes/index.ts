import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import brandsRouter from "./brands";
import ordersRouter from "./orders";
import bannersRouter from "./banners";
import settingsRouter from "./settings";
import couponsRouter from "./coupons";
import dashboardRouter from "./dashboard";
import reviewsRouter from "./reviews";
import newsletterRouter from "./newsletter";

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
