// src/utils/formatters.js - Formateo de datos
function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
}
function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-CO');
}
function formatearPorcentaje(valor) {
  return (valor * 100).toFixed(1) + '%';
}
function periodoActual() {
  return new Date().toISOString().slice(0, 7);
}
module.exports = { formatearMoneda, formatearFecha, formatearPorcentaje, periodoActual };
