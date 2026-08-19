import type { Request, Response } from "express";
import { accountService } from "../application/account.service";

// Dummy user ID for now until Auth is implemented (matches existing DB records)
const DUMMY_USER_ID = "9a1b181c-d789-4d6b-873f-c12140a32456";

export async function getAccounts(req: Request, res: Response) {
  try {
    const accounts = await accountService.getAccounts(DUMMY_USER_ID);
    res.status(200).json({ data: accounts });
  } catch (error) {
    console.error("Failed to fetch accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
}

export async function getAccountById(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const account = await accountService.getAccountById(id);
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    // Simple check to ensure account belongs to dummy user (for safety)
    if (account.userId !== DUMMY_USER_ID) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.status(200).json({ data: account });
  } catch (error) {
    console.error("Failed to fetch account:", error);
    res.status(500).json({ error: "Failed to fetch account" });
  }
}

export async function createAccount(req: Request, res: Response) {
  try {
    const { name, currency, balance, isPrimary } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Account name is required" });
      return;
    }

    const account = await accountService.createAccount({
      userId: DUMMY_USER_ID,
      name: name.trim(),
      currency: currency || "INR",
      balance: Number(balance) || 0,
      isPrimary: Boolean(isPrimary),
    });

    res.status(201).json({ data: account });
  } catch (error) {
    console.error("Failed to create account:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
}

export async function updateAccount(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, currency, balance, isPrimary } = req.body;

    const account = await accountService.updateAccount(id, DUMMY_USER_ID, {
      name: name?.trim(),
      currency,
      balance: balance !== undefined ? Number(balance) : undefined,
      isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : undefined,
    });

    res.status(200).json({ data: account });
  } catch (error) {
    console.error("Failed to update account:", error);
    res.status(500).json({ error: "Failed to update account" });
  }
}

export async function updateBalance(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { balance } = req.body;

    if (balance === undefined || isNaN(Number(balance))) {
      res.status(400).json({ error: "Valid balance is required" });
      return;
    }

    const account = await accountService.updateBalance(id, Number(balance));
    res.status(200).json({ data: account });
  } catch (error) {
    console.error("Failed to update balance:", error);
    res.status(500).json({ error: "Failed to update balance" });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await accountService.deleteAccount(id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
}

export async function transferBalance(req: Request, res: Response) {
  try {
    const { sourceId, destId, sourceAmount, convertedAmount } = req.body;

    if (!sourceId || !destId || isNaN(Number(sourceAmount)) || isNaN(Number(convertedAmount))) {
      res.status(400).json({ error: "Invalid transfer parameters" });
      return;
    }

    const result = await accountService.transferBalance(
      sourceId,
      destId,
      Number(sourceAmount),
      Number(convertedAmount)
    );

    res.status(200).json({ data: result });
  } catch (error) {
    console.error("Failed to transfer balance:", error);
    res.status(500).json({ error: "Failed to transfer balance" });
  }
}
