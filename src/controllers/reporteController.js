// src/controllers/reporteController.js
const dataService = require('../services/dataService');
const calculoService = require('../services/calculoService');

function reporteCategorias(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const data = dataService.loadData();
  const gastos = calculoService.filtrarPorPeriodo(data.gastos, periodo);
  const presupuesto = data.presupuestos.find(p => p.periodo === periodo);
  const porCategoria = calculoService.gastosPorCategoria(gastos);
  const porcentajes = calculoService.porcentajePorCategoria(gastos);
  const ejecucion = presupuesto ? calculoService.ejecucionPresupuesto(gastos, presupuesto.categoriasAsignadas) : {};
  res.json({ periodo, porCategoria, porcentajes, ejecucion, totalGastos: calculoService.totalGastos(gastos), presupuesto });
}

function reporteHistorico(req, res) {
  const { periodo, comparar } = req.query;
  const data = dataService.loadData();
  function resumen(p) {
    const ing = calculoService.filtrarPorPeriodo(data.ingresos, p);
    const gas = calculoService.filtrarPorPeriodo(data.gastos, p);
    return { periodo: p, totalIngresos: calculoService.totalIngresos(ing), totalGastos: calculoService.totalGastos(gas), saldo: calculoService.totalIngresos(ing)-calculoService.totalGastos(gas), porCategoria: calculoService.gastosPorCategoria(gas) };
  }
  if (periodo) {
    const actual = resumen(periodo);
    if (comparar) {
      const comp = resumen(comparar);
      return res.json({ actual, comparacion: comp });
    }
    return res.json(actual);
  }
  // listar todos los periodos disponibles
  const periodos = [...new Set([...data.ingresos, ...data.gastos].map(t => t.fecha.slice(0,7)))].sort();
  const resumenes = periodos.map(p => resumen(p));
  res.json({ periodos, resumenes });
}

function listarTransacciones(req, res) {
  const periodo = req.query.periodo;
  const data = dataService.loadData();
  let transacciones = [
    ...data.ingresos.map(i => ({ ...i, tipo: 'ingreso' })),
    ...data.gastos.map(g => ({ ...g, tipo: 'gasto' }))
  ];
  if (periodo) transacciones = transacciones.filter(t => t.fecha.startsWith(periodo));
  transacciones.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
  res.json(transacciones);
}

module.exports = { reporteCategorias, reporteHistorico, listarTransacciones };
