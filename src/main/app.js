// src/main/app.js - SmartBusinessHome v2.0
const express = require('express');
const path = require('path');
const ingresoController = require('../controllers/ingresoController');
const gastoController = require('../controllers/gastoController');
const presupuestoController = require('../controllers/presupuestoController');
const categoriaController = require('../controllers/categoriaController');
const balanceController = require('../controllers/balanceController');
const reporteController = require('../controllers/reporteController');
const alertaController = require('../controllers/alertaController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const exportService = require('../services/exportService');
const dataService = require('../services/dataService');
const { getDb } = require('../services/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const settings = require('../config/settings');

const app = express();
const PORT = settings.port;

// Init DB early (crea schema + admin)
getDb();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers básicos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Logger simple
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Rate limit login: 30 intentos / 5 min, solo fallos cuentan; éxito resetea
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const key = req.ip || req.headers['x-forwarded-for'] || 'global';
  const now = Date.now();
  let entry = loginAttempts.get(key);
  if (!entry || now > entry.reset) entry = { count: 0, reset: now + 5*60*1000 };
  if (entry.count >= 30) return res.status(429).json({ error: 'Demasiados intentos. Espere 5 minutos o reinicie el servidor. Si persiste, use POST /api/auth/reset-limit.' });
  entry.count++;
  loginAttempts.set(key, entry);
  // Si la respuesta es exitosa (200), resetea el contador; si no es 401, no debería contar tanto
  res.on('finish', () => {
    if (res.statusCode === 200) {
      loginAttempts.delete(key);
    } else if (res.statusCode !== 401 && res.statusCode !== 429) {
      const e = loginAttempts.get(key);
      if (e) { e.count = Math.max(0, e.count - 1); loginAttempts.set(key, e); }
    }
  });
  next();
}

// Static
app.use('/assets', express.static(path.join(__dirname, '../../assets')));
app.use('/src/views', express.static(path.join(__dirname, '../views')));
app.use(express.static(path.join(__dirname, '../views/layouts')));
app.use(express.static(path.join(__dirname, '../../assets')));

// --- Public API
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: settings.appName, version: settings.version }));
app.post('/api/auth/login', rateLimitLogin, authController.login);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/reset-limit', (req, res) => { loginAttempts.clear(); res.json({ message: 'Rate limit reseteado' }); });
// Config pública (tema)
app.get('/api/app-config', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT clave, valor FROM app_config').all();
    const obj={}; rows.forEach(r=> obj[r.clave]=r.valor);
    res.json(obj);
  } catch(e){ res.json({ tema:'claro', colorPrimario:'#1a73e8', colorFondo:'#f5f7fa' }); }
});

// --- Protected API (requireAuth)
app.get('/api/auth/me', requireAuth, authController.me);
app.post('/api/auth/change-password', requireAuth, authController.changePassword);

// Ingresos
app.get('/api/ingresos', requireAuth, ingresoController.listar);
app.get('/api/ingresos/:id', requireAuth, ingresoController.obtener);
app.post('/api/ingresos', requireAuth, ingresoController.crear);
app.put('/api/ingresos/:id', requireAuth, ingresoController.actualizar);
app.delete('/api/ingresos/:id', requireAuth, ingresoController.eliminar);

// Gastos
app.get('/api/gastos', requireAuth, gastoController.listar);
app.get('/api/gastos/:id', requireAuth, gastoController.obtener);
app.post('/api/gastos', requireAuth, gastoController.crear);
app.put('/api/gastos/:id', requireAuth, gastoController.actualizar);
app.delete('/api/gastos/:id', requireAuth, gastoController.eliminar);

// Presupuestos
app.get('/api/presupuestos', requireAuth, presupuestoController.listar);
app.get('/api/presupuestos/:id', requireAuth, presupuestoController.obtener);
app.post('/api/presupuestos', requireAuth, presupuestoController.crearOActualizar);
app.delete('/api/presupuestos/:id', requireAuth, presupuestoController.eliminar);

// Categorías
app.get('/api/categorias', requireAuth, categoriaController.listar);
app.post('/api/categorias', requireAuth, categoriaController.crear);
app.put('/api/categorias/:id', requireAuth, categoriaController.actualizar);
app.delete('/api/categorias/:id', requireAuth, categoriaController.eliminar);

// Balance / Reportes / Alertas / Análisis
app.get('/api/balance', requireAuth, balanceController.obtenerBalance);
app.get('/api/reportes/categorias', requireAuth, reporteController.reporteCategorias);
app.get('/api/reportes/historico', requireAuth, reporteController.reporteHistorico);
app.get('/api/reportes/transacciones', requireAuth, reporteController.listarTransacciones);
app.get('/api/analisis', requireAuth, reporteController.analisisCompleto);
app.get('/api/alertas', requireAuth, alertaController.listarAlertas);

// Export (usuario aislado) - v2.1: CSV unificado + XLSX + PDF (se mantienen rutas legacy para compatibilidad)
app.get('/api/export/ingresos', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM ingresos WHERE usuario_id=?').all(req.user.id);
  const mapped = rows.map(r=>({ id:String(r.id), monto:r.monto, fecha:r.fecha, categoria:r.categoria, fuente:r.fuente, descripcion:r.descripcion }));
  const csv = exportService.exportarIngresosCSV(mapped);
  res.header('Content-Type','text/csv'); res.attachment('ingresos.csv'); res.send(csv);
});
app.get('/api/export/gastos', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM gastos WHERE usuario_id=?').all(req.user.id);
  const mapped = rows.map(r=>({ id:String(r.id), monto:r.monto, fecha:r.fecha, categoria:r.categoria, descripcion:r.descripcion }));
  const csv = exportService.exportarGastosCSV(mapped);
  res.header('Content-Type','text/csv'); res.attachment('gastos.csv'); res.send(csv);
});
app.get('/api/export/presupuestos', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=?').all(req.user.id);
  const mapped = rows.map(r=>{
    const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(r.id);
    const map={}; cats.forEach(c=> map[c.categoria]=c.monto);
    return { periodo:r.periodo, categoriasAsignadas:map, presupuestoTotal:r.presupuesto_total };
  });
  const flat = [];
  mapped.forEach(p=>{ for(const cat in (p.categoriasAsignadas||{})) flat.push({ periodo:p.periodo, categoria:cat, monto:p.categoriasAsignadas[cat], total:p.presupuestoTotal }); });
  const csv = exportService.toCSV(flat, ['periodo','categoria','monto','total']);
  res.header('Content-Type','text/csv'); res.attachment('presupuestos.csv'); res.send(csv);
});
// Nuevos endpoints unificados v2.1
function getUserData(userId) {
  const db = getDb();
  const ingresos = db.prepare('SELECT * FROM ingresos WHERE usuario_id=?').all(userId).map(r=>({ id:String(r.id), monto:r.monto, fecha:r.fecha, categoria:r.categoria, fuente:r.fuente, descripcion:r.descripcion }));
  const gastos = db.prepare('SELECT * FROM gastos WHERE usuario_id=?').all(userId).map(r=>({ id:String(r.id), monto:r.monto, fecha:r.fecha, categoria:r.categoria, descripcion:r.descripcion }));
  const presupRows = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=?').all(userId);
  const presupuestos = presupRows.map(r=>{
    const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(r.id);
    const map={}; cats.forEach(c=> map[c.categoria]=c.monto);
    return { periodo:r.periodo, categoriasAsignadas:map, presupuestoTotal:r.presupuesto_total };
  });
  return { ingresos, gastos, presupuestos };
}
app.get('/api/export/csv', requireAuth, (req, res) => {
  const { ingresos, gastos, presupuestos } = getUserData(req.user.id);
  const csv = exportService.exportarCombinadoCSV(ingresos, gastos, presupuestos);
  res.header('Content-Type','text/csv; charset=utf-8'); res.attachment('SmartBusinessHome.csv'); res.send(csv);
});
app.get('/api/export/xlsx', requireAuth, async (req, res) => {
  try {
    const { ingresos, gastos, presupuestos } = getUserData(req.user.id);
    const buf = await exportService.exportarXLSX(ingresos, gastos, presupuestos);
    res.header('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('SmartBusinessHome.xlsx'); res.send(buf);
  } catch(e){ res.status(500).json({ error: 'Error generando XLSX: '+e.message }); }
});
app.get('/api/export/pdf', requireAuth, async (req, res) => {
  try {
    const { ingresos, gastos, presupuestos } = getUserData(req.user.id);
    const buf = await exportService.exportarPDF(ingresos, gastos, presupuestos);
    res.header('Content-Type','application/pdf');
    res.attachment('SmartBusinessHome.pdf'); res.send(buf);
  } catch(e){ res.status(500).json({ error: 'Error generando PDF: '+e.message }); }
});
app.post('/api/backup', requireAuth, (req, res) => {
  const file = dataService.backupData();
  res.json({ message:'Respaldo creado', file });
});

// --- Admin only
app.get('/api/admin/usuarios', requireAuth, requireAdmin, adminController.listarUsuarios);
app.post('/api/admin/usuarios', requireAuth, requireAdmin, adminController.crearUsuario);
app.put('/api/admin/usuarios/:id', requireAuth, requireAdmin, adminController.actualizarUsuario);
app.delete('/api/admin/usuarios/:id', requireAuth, requireAdmin, adminController.eliminarUsuario);
app.post('/api/admin/usuarios/:id/reset-password', requireAuth, requireAdmin, adminController.resetPassword);
app.get('/api/admin/config', requireAuth, requireAdmin, adminController.getConfig);
app.post('/api/admin/config', requireAuth, requireAdmin, adminController.setConfig);
app.get('/api/admin/backups', requireAuth, requireAdmin, adminController.listarBackups);
app.post('/api/admin/backup', requireAuth, requireAdmin, adminController.crearBackup);

// SPA
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../views/layouts/main.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, '../views/layouts/login.html')); });

// 404 API
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`SmartBusinessHome v${settings.version} en http://localhost:${PORT} — admin: admin / Admin123!`));
}
module.exports = app;
