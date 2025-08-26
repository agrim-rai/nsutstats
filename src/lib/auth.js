import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET or NEXTAUTH_SECRET not found in environment variables');
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully:', { userId: decoded.userId, role: decoded.role });
    return decoded;
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return null;
  }
}

export function getTokenFromHeader(req) {
  const authHeader = req.headers.get ? req.headers.get('authorization') : req.headers.authorization;
  console.log('Auth header found:', authHeader ? 'Present' : 'Missing');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticateUser(req) {
  const token = getTokenFromHeader(req);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return decoded;
}


