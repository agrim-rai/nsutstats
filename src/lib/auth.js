import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('not found in .env');
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
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

export function authenticateAdmin(username, password) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminUsername || !adminPassword) {
    throw new Error('Admin credentials not configured');
  }
  
  return username === adminUsername && password === adminPassword;
}

export function generateAdminToken() {
  return generateToken({
    userId: 'admin',
    username: process.env.ADMIN_USERNAME,
    role: 'admin'
  });
}
