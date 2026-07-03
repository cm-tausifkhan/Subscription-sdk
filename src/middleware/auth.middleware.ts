import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '../types'

/* Extend Express Request to include user */
export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: UserRole
    name: string
  }
}

/*
 * Middleware - verifies JWT token on every protected route
 * If token is invalid or expired it returns 401
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      email: string
      role: UserRole
      name: string
    }
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

/*
 * Middleware - only allows admin role
 */
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}