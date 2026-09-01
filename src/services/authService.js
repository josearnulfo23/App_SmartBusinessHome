// src/services/authService.js - Lógica de autenticación segura
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');
const authConfig = require('../config/auth');

function hashPassword(plain) {
  return bcrypt.hashSync(plain, authConfig.bcryptRounds);
}
function verifyPassword(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}
function generateToken(payload) {
  return jwt.sign(payload, authConfig.jwtSecret, { expiresIn: authConfig.jwtExpiresIn });
}
function verifyToken(token) {
  return jwt.verify(token, authConfig.jwtSecret);
}

function registrarUsuario({ username, password, displayName, role = 'user' }) {
  if (!username || !username.trim()) throw Object.assign(new Error('Username obligatorio'), { status: 400 });
  if (!password || password.length < 6) throw Object.assign(new Error('Clave mínima 6 caracteres'), { status: 400 });
  // política clave: al menos 1 mayúscula, 1 número
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) throw Object.assign(new Error('Clave debe tener al menos 1 mayúscula y 1 número'), { status: 400 });
  const db = getDb();
  const exists = db.prepare('SELECT id FROM usuarios WHERE username = ? COLLATE NOCASE').get(username.trim());
  if (exists) throw Object.assign(new Error('Usuario ya existe'), { status: 409 });
  const hash = hashPassword(password);
  const res = db.prepare('INSERT INTO usuarios (username, password_hash, display_name, role) VALUES (?,?,?,?)')
    .run(username.trim(), hash, displayName || username.trim(), role === 'admin' ? 'admin' : 'user');
  return { id: res.lastInsertRowid, username: username.trim(), displayName: displayName || username.trim(), role };
}

function autenticar(username, password) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM usuarios WHERE username = ? COLLATE NOCASE').get(username);
  if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  if (!verifyPassword(password, user.password_hash)) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  const token = generateToken({ id: user.id, username: user.username, role: user.role, displayName: user.display_name });
  return { token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role } };
}

function listarUsuarios() {
  const db = getDb();
  return db.prepare('SELECT id, username, display_name as displayName, role, created_at as createdAt FROM usuarios ORDER BY id').all();
}
function obtenerUsuario(id) {
  const db = getDb();
  return db.prepare('SELECT id, username, display_name as displayName, role, created_at as createdAt FROM usuarios WHERE id = ?').get(id);
}
function actualizarUsuario(id, { displayName, role, password }) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
  if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  if (role && !['admin','user'].includes(role)) throw Object.assign(new Error('Rol inválido'), { status: 400 });
  let hash = user.password_hash;
  if (password) {
    if (password.length < 6) throw Object.assign(new Error('Clave mínima 6 caracteres'), { status: 400 });
    hash = hashPassword(password);
  }
  db.prepare("UPDATE usuarios SET display_name = COALESCE(?, display_name), role = COALESCE(?, role), password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .run(displayName || null, role || null, hash, id);
  return obtenerUsuario(id);
}
function eliminarUsuario(id, requesterId) {
  if (Number(id) === Number(requesterId)) throw Object.assign(new Error('No puedes eliminarte a ti mismo'), { status: 400 });
  const db = getDb();
  const res = db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  if (res.changes === 0) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return true;
}

module.exports = { hashPassword, verifyPassword, generateToken, verifyToken, registrarUsuario, autenticar, listarUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario };
