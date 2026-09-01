// src/services/calculoService.js - Cálculos financieros
function totalIngresos(ingresos) {
  return ingresos.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0);
}
function totalGastos(gastos) {
  return gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
}
function balance(ingresos, gastos) {
  return totalIngresos(ingresos) - totalGastos(gastos);
}
function gastosPorCategoria(gastos) {
  const map = {};
  gastos.forEach(g => {
    const cat = g.categoria || 'Otros';
    map[cat] = (map[cat] || 0) + parseFloat(g.monto);
  });
  return map;
}
function porcentajePorCategoria(gastos) {
  const total = totalGastos(gastos);
  if (total === 0) return {};
  const porCat = gastosPorCategoria(gastos);
  const result = {};
  for (const cat in porCat) {
    result[cat] = porCat[cat] / total;
  }
  return result;
}
function ejecucionPresupuesto(gastos, presupuestos) {
  // presupuestos: { categoria: monto }
  const porCat = gastosPorCategoria(gastos);
  const result = {};
  for (const cat in presupuestos) {
    const pres = parseFloat(presupuestos[cat]) || 0;
    const ejec = porCat[cat] || 0;
    result[cat] = {
      presupuestado: pres,
      ejecutado: ejec,
      porcentaje: pres > 0 ? ejec / pres : 0,
      restante: pres - ejec
    };
  }
  // categorías con gasto pero sin presupuesto
  for (const cat in porCat) {
    if (!(cat in result)) {
      result[cat] = { presupuestado: 0, ejecutado: porCat[cat], porcentaje: porCat[cat] > 0 ? Infinity : 0, restante: -porCat[cat] };
    }
  }
  return result;
}
function filtrarPorPeriodo(items, periodo) {
  if (!periodo) return items;
  return items.filter(i => i.fecha && i.fecha.startsWith(periodo));
}

module.exports = { totalIngresos, totalGastos, balance, gastosPorCategoria, porcentajePorCategoria, ejecucionPresupuesto, filtrarPorPeriodo };
