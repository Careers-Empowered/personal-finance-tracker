import { Router } from "express";

import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  updateBalance,
  deleteAccount,
  transferBalance,
} from "./account.controller";

const router = Router();

router.get("/", getAccounts);
router.post("/", createAccount);
router.post("/transfer", transferBalance);
router.put("/:id", updateAccount);
router.patch("/:id/balance", updateBalance);
router.get("/:id", getAccountById);
router.delete("/:id", deleteAccount);

export default router;
