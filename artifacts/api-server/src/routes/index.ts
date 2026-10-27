import { Router, type IRouter } from "express";
import campusTagRouter from "./campus-tag";
import healthRouter from "./health";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(campusTagRouter);
router.use(storageRouter);

export default router;
