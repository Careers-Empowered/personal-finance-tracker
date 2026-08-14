import { Request, Response, NextFunction } from 'express';
import { prisma } from '../infrastructure/postgres/prismaClient';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }

    req.userId = session.userId;
    req.userEmail = session.user.email;
    next();
  } catch (error) {
    console.error('Auth middleware database lookup error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
export default authMiddleware;
