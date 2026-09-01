// src/controllers/balanceController.js v2.0 - SQLite
const { getDb } = require('../services/db');
const calculoService = require('../services/calculoService');

function obtenerBalance(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const db = getDb();
  const ingresos = db.prepare('SELECT * FROM ingresos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%');
  const gastos = db.prepare('SELECT * FROM gastos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%');
  // mapeo para calculoService compatible
  const ingMapped = ingresos.map(r=>({monto:r.monto}));
  const gasMapped = gastos.map(r=>({monto:r.monto}));
  const totalIngresos = calculoService.totalIngresos(ingMapped);
  const totalGastos = calculoService.totalGastos(gasMapped);
  const saldo = totalIngresos - totalGastos;
  res.json({ periodo, totalIngresos, totalGastos, saldo, estado: saldo>=0?'superavit':'deficit', countIngresos: ingresos.length, countGastos: gastos.length });
}
module.exports = { obtenerBalance };
