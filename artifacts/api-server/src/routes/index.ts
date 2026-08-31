import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import movementsRouter from "./movements";
import dashboardRouter from "./dashboard";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(movementsRouter);
router.use(dashboardRouter);
router.use(profileRouter);

export default router;
