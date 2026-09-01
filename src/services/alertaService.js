// src/services/alertaService.js - Gestión de alertas de presupuesto
const { UMBRAL_ALERTA_ADVERTENCIA, UMBRAL_ALERTA_EXCEDIDO } = require('../config/constants');
const { ejecucionPresupuesto } = require('./calculoService');

function generarAlertas(gastos, presupuesto) {
  if (!presupuesto || !presupuesto.categoriasAsignadas) return [];
  const ejec = ejecucionPresupuesto(gastos, presupuesto.categoriasAsignadas);
  const alertas = [];
  for (const cat in ejec) {
    const { presupuestado, ejecutado, porcentaje } = ejec[cat];
    if (presupuestado <= 0) continue;
    if (porcentaje >= UMBRAL_ALERTA_EXCEDIDO) {
      alertas.push({ categoria: cat, tipo: 'excedido', nivel: 'error', mensaje: `¡Excedido! ${cat}: ${ejecutado} / ${presupuestado} (${(porcentaje*100).toFixed(1)}%)`, porcentaje, presupuestado, ejecutado });
    } else if (porcentaje >= UMBRAL_ALERTA_ADVERTENCIA) {
      alertas.push({ categoria: cat, tipo: 'advertencia', nivel: 'warning', mensaje: `Advertencia: ${cat} al ${(porcentaje*100).toFixed(1)}% del presupuesto (${ejecutado} / ${presupuestado})`, porcentaje, presupuestado, ejecutado });
    }
  }
  return alertas;
}

function estadoPresupuesto(porcentaje) {
  if (porcentaje >= 1) return 'excedido';
  if (porcentaje >= 0.8) return 'advertencia';
  return 'normal';
}

module.exports = { generarAlertas, estadoPresupuesto };
