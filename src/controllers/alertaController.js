// src/controllers/alertaController.js
const dataService = require('../services/dataService');
const calculoService = require('../services/calculoService');
const alertaService = require('../services/alertaService');

function listarAlertas(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const data = dataService.loadData();
  const gastos = calculoService.filtrarPorPeriodo(data.gastos, periodo);
  const presupuesto = data.presupuestos.find(p => p.periodo === periodo);
  if (!presupuesto) return res.json([]);
  const alertas = alertaService.generarAlertas(gastos, presupuesto);
  res.json(alertas);
}

module.exports = { listarAlertas };
