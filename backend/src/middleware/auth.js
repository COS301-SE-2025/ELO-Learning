// auth.js - Authentication middleware
import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(
    `[AUTH] verifyToken middleware entered. Authorization header:`,
    authHeader,
  );

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[AUTH] No valid token provided. Header:`, authHeader);
    return res.status(401).json({
      error: 'Access denied. No valid token provided.',
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  console.log('[verifyToken] Extracted token:', token);

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] JWT verified. Decoded:`, decoded);

    // Add user info to request object for use in route handlers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    console.error('[verifyToken] Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      console.warn(`[AUTH] Token expired. Error:`, error);
      return res.status(401).json({
        error: 'Token has expired. Please log in again.',
      });
    } else if (error.name === 'JsonWebTokenError') {
      console.warn(`[AUTH] Invalid token. Error:`, error);
      return res.status(401).json({
        error: 'Invalid token.',
      });
    } else {
      console.error('[AUTH] Token verification error:', error);
      return res.status(500).json({
        error: 'Internal server error during authentication.',
      });
    }
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * Useful for routes that work for both authenticated and unauthenticated users
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user info
    req.user = null;
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    // Invalid token, but don't fail the request
    req.user = null;
  }

  next();
}
