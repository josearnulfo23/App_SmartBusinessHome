// src/utils/helpers.js - Funciones auxiliares
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function filtrarPorPeriodo(items, periodo) {
  // periodo: YYYY-MM
  return items.filter(i => i.fecha && i.fecha.startsWith(periodo));
}
function ordenarPorFecha(items, asc = false) {
  return [...items].sort((a, b) => asc ? new Date(a.fecha) - new Date(b.fecha) : new Date(b.fecha) - new Date(a.fecha));
}
function paginar(items, page = 1, limit = 50) {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}
function agruparPorCategoria(gastos) {
  const map = {};
  gastos.forEach(g => {
    map[g.categoria] = (map[g.categoria] || 0) + parseFloat(g.monto);
  });
  return map;
}
module.exports = { generarId, filtrarPorPeriodo, ordenarPorFecha, paginar, agruparPorCategoria };
