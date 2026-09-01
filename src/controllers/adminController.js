// src/controllers/adminController.js - Solo admin
const authService = require('../services/authService');
const { getDb } = require('../services/db');
const dataService = require('../services/dataService');
const fs = require('fs');
const path = require('path');

function listarUsuarios(req, res) { res.json(authService.listarUsuarios()); }
function crearUsuario(req, res) {
  try {
    const { username, password, displayName, role } = req.body;
    const user = authService.registrarUsuario({ username, password, displayName, role: role || 'user' });
    res.status(201).json(user);
  } catch(e){ res.status(e.status||400).json({ error: e.message }); }
}
function actualizarUsuario(req, res) {
  try { const u = authService.actualizarUsuario(req.params.id, req.body); res.json(u); }
  catch(e){ res.status(e.status||400).json({ error: e.message }); }
}
function eliminarUsuario(req, res) {
  try { authService.eliminarUsuario(req.params.id, req.user.id); res.json({ message:'Usuario eliminado' }); }
  catch(e){ res.status(e.status||400).json({ error: e.message }); }
}
function resetPassword(req, res) {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error:'newPassword obligatorio' });
    authService.actualizarUsuario(req.params.id, { password: newPassword });
    res.json({ message:'Clave restablecida' });
  } catch(e){ res.status(e.status||400).json({ error: e.message }); }
}

// Config app (tema, colores)
function getConfig(req, res) {
  const db = getDb();
  const rows = db.prepare('SELECT clave, valor, descripcion FROM app_config').all();
  const obj={}; rows.forEach(r=> obj[r.clave]=r.valor);
  res.json(obj);
}
function setConfig(req, res) {
  const db = getDb();
  const { tema, colorPrimario, colorFondo } = req.body;
  if (tema) db.prepare("INSERT INTO app_config (clave, valor) VALUES ('tema',?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor").run(tema);
  if (colorPrimario) db.prepare("INSERT INTO app_config (clave, valor) VALUES ('colorPrimario',?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor").run(colorPrimario);
  if (colorFondo) db.prepare("INSERT INTO app_config (clave, valor) VALUES ('colorFondo',?) ON CONFLICT(clave) DO UPDATE SET valor=excluded.valor").run(colorFondo);
  res.json({ message:'Configuración actualizada' });
}

function listarBackups(req, res) { res.json(dataService.listBackups().map(b=>({ file:b.file, date:b.date }))); }
function crearBackup(req, res) {
  const file = dataService.backupData();
  res.json({ message:'Respaldo creado', file });
}
function restaurarBackup(req, res) {
  // Restaurar desde un backup JSON: valida y reemplaza datos del usuario? Por seguridad solo admin y backup completo
  // Aquí: simplemente informar que debe copiar manualmente; no auto-restaurar para evitar pérdida accidental
  res.status(400).json({ error:'Restauración automática deshabilitada por seguridad. Copie el archivo de backup manualmente a data/database/ y reinicie.' });
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, resetPassword, getConfig, setConfig, listarBackups, crearBackup, restaurarBackup };
