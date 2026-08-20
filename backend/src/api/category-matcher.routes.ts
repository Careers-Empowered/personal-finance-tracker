import { Router } from "express";
import { matchCategory } from "./category-matcher.controller";

const router = Router();

router.post("/match", matchCategory);

export default router;