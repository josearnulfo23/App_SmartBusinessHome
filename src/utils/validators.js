// src/utils/validators.js - Validadores
function validarMonto(monto) {
  const n = parseFloat(monto);
  if (isNaN(n) || n <= 0) return 'El monto debe ser un número mayor a 0.';
  if (n > 999999999) return 'El monto excede el límite permitido.';
  return null;
}
function validarFecha(fecha) {
  if (!fecha) return 'La fecha es obligatoria.';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return 'Fecha inválida.';
  return null;
}
function validarCategoria(categoria) {
  if (!categoria || !categoria.trim()) return 'La categoría es obligatoria.';
  return null;
}
function validarDescripcion(desc) {
  if (desc && desc.length > 200) return 'La descripción no puede exceder 200 caracteres.';
  return null;
}
function validarTransaccion(data) {
  const errores = [];
  const e1 = validarMonto(data.monto); if (e1) errores.push(e1);
  const e2 = validarFecha(data.fecha); if (e2) errores.push(e2);
  const e3 = validarCategoria(data.categoria); if (e3) errores.push(e3);
  const e4 = validarDescripcion(data.descripcion); if (e4) errores.push(e4);
  return errores;
}
module.exports = { validarMonto, validarFecha, validarCategoria, validarDescripcion, validarTransaccion };
