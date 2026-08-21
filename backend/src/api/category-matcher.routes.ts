import { Router } from "express";
import { matchCategory } from "./category-matcher.controller";
import { authMiddleware } from "../security/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.post("/match", matchCategory);

export default router;