// src/controllers/alertaController.js v2.0 SQLite
const { getDb } = require('../services/db');
const alertaService = require('../services/alertaService');

function listarAlertas(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const db = getDb();
  const gastos = db.prepare('SELECT categoria, monto FROM gastos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%').map(r=>({categoria:r.categoria, monto:r.monto}));
  const pres = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=? AND periodo=?').get(req.user.id, periodo);
  if (!pres) return res.json([]);
  const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(pres.id);
  const map={}; cats.forEach(c=> map[c.categoria]=c.monto);
  const presupuesto = { categoriasAsignadas: map };
  const alertas = alertaService.generarAlertas(gastos, presupuesto);
  res.json(alertas);
}
module.exports = { listarAlertas };
