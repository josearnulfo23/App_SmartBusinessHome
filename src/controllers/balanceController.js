// src/controllers/balanceController.js
const dataService = require('../services/dataService');
const calculoService = require('../services/calculoService');

function obtenerBalance(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const data = dataService.loadData();
  const ingresos = calculoService.filtrarPorPeriodo(data.ingresos, periodo);
  const gastos = calculoService.filtrarPorPeriodo(data.gastos, periodo);
  const totalIngresos = calculoService.totalIngresos(ingresos);
  const totalGastos = calculoService.totalGastos(gastos);
  const saldo = totalIngresos - totalGastos;
  const estado = saldo >= 0 ? 'superavit' : 'deficit';
  res.json({ periodo, totalIngresos, totalGastos, saldo, estado, countIngresos: ingresos.length, countGastos: gastos.length });
}

module.exports = { obtenerBalance };
