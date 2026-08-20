import type { Request, Response } from "express";
import { prisma } from "../infrastructure/postgres/prisma";
import { hashPassword, verifyPassword, generateToken } from "../security/password";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      res.status(400).json({ error: "Password must be at least 4 characters long" });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    if (existingUser) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    // Create user
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: emailTrimmed,
        passwordHash,
      },
    });

    // Create session (expires in 24 hours)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    res.status(201).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailTrimmed },
    });

    if (!user) {
      // 404 is useful so the frontend knows that the email is not registered
      res.status(404).json({ error: "Email not registered" });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: "External account login required or invalid credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Create session (expires in 24 hours)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    res.status(200).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        await prisma.session.delete({
          where: { token },
        }).catch(() => {}); // ignore error if session already deleted
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to log out" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
}
