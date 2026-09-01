// src/services/validacionService.js - Validaciones de negocio
const { validarTransaccion } = require('../utils/validators');

function validarIngreso(data) {
  return validarTransaccion(data);
}
function validarGasto(data) {
  return validarTransaccion(data);
}
function validarPresupuesto(data) {
  const errores = [];
  if (!data.periodo || !/^\d{4}-\d{2}$/.test(data.periodo)) errores.push('Periodo debe tener formato YYYY-MM.');
  if (data.presupuestoTotal != null && (isNaN(parseFloat(data.presupuestoTotal)) || parseFloat(data.presupuestoTotal) < 0)) errores.push('Presupuesto total inválido.');
  if (data.categoriasAsignadas) {
    for (const cat in data.categoriasAsignadas) {
      const v = parseFloat(data.categoriasAsignadas[cat]);
      if (isNaN(v) || v < 0) errores.push(`Monto inválido para categoría ${cat}.`);
    }
    const suma = Object.values(data.categoriasAsignadas).reduce((s, v) => s + parseFloat(v || 0), 0);
    const total = parseFloat(data.presupuestoTotal || 0);
    if (total > 0 && suma > total) errores.push('La suma por categorías excede el presupuesto total.');
  }
  return errores;
}
function validarCategoria(data) {
  const errores = [];
  if (!data.nombre || !data.nombre.trim()) errores.push('Nombre de categoría obligatorio.');
  if (!['ingreso', 'gasto'].includes(data.tipo)) errores.push('Tipo debe ser ingreso o gasto.');
  return errores;
}

module.exports = { validarIngreso, validarGasto, validarPresupuesto, validarCategoria };
