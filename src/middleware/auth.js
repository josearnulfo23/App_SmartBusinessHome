// src/middleware/auth.js - JWT + RBAC
const { verifyToken } = require('../services/authService');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : (req.query.token || req.headers['x-auth-token'] || null);
  if (!token) return res.status(401).json({ error: 'No autenticado. Inicie sesión.' });
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesión expirada o inválida. Inicie sesión nuevamente.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
  next();
}

module.exports = { requireAuth, requireAdmin };
