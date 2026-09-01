// src/controllers/authController.js
const authService = require('../services/authService');

function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Usuario y clave son obligatorios' });
    const result = authService.autenticar(username, password);
    res.json(result);
  } catch (e) { res.status(e.status || 401).json({ error: e.message }); }
}

function register(req, res) {
  try {
    // Solo admin puede crear usuarios con rol admin; usuarios normales se auto-registran como 'user'
    const { username, password, displayName, role } = req.body;
    let finalRole = 'user';
    if (req.user && req.user.role === 'admin' && role === 'admin') finalRole = 'admin';
    const user = authService.registrarUsuario({ username, password, displayName, role: finalRole });
    res.status(201).json(user);
  } catch (e) { res.status(e.status || 400).json({ error: e.message }); }
}

function me(req, res) {
  const user = authService.obtenerUsuario(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
}

function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Datos incompletos' });
    const { getDb } = require('../services/db');
    const bcrypt = require('bcryptjs');
    const db = getDb();
    const row = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.user.id);
    if (!bcrypt.compareSync(currentPassword, row.password_hash)) return res.status(401).json({ error: 'Clave actual incorrecta' });
    authService.actualizarUsuario(req.user.id, { password: newPassword });
    res.json({ message: 'Clave actualizada correctamente' });
  } catch (e) { res.status(e.status || 400).json({ error: e.message }); }
}

module.exports = { login, register, me, changePassword };
