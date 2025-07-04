// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(401)
      .json({ error: 'You are unauthorized to make this request.' });
    return;
  }

  // Here you would typically verify the JWT token
  // For now, we'll just check if the token exists
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    res.status(401).json({ error: 'Invalid token.' });
    return;
  }

  // TODO: Implement proper JWT verification
  // For now, just proceed
  next();
};
