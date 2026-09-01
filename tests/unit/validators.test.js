// tests/unit/validators.test.js
const assert = require('assert');
const { describe, it } = require('node:test');
const v = require('../../src/utils/validators');
const { validarPresupuesto } = require('../../src/services/validacionService');

describe('validators', () => {
  it('validarMonto rechaza 0 y negativos', () => {
    assert.ok(v.validarMonto(0));
    assert.ok(v.validarMonto(-10));
    assert.ok(v.validarMonto('abc'));
    assert.strictEqual(v.validarMonto(100), null);
  });
  it('validarFecha rechaza vacia e invalida', () => {
    assert.ok(v.validarFecha(''));
    assert.ok(v.validarFecha('no-fecha'));
    assert.strictEqual(v.validarFecha('2026-03-15'), null);
  });
  it('validarTransaccion retorna errores', () => {
    const e = v.validarTransaccion({ monto: -5, fecha: '', categoria: '' });
    assert.ok(e.length >= 3);
  });
  it('validarPresupuesto detecta periodo invalido', () => {
    const e = validarPresupuesto({ periodo: '2026/03', presupuestoTotal: 1000 });
    assert.ok(e.length > 0);
  });
  it('validarPresupuesto detecta suma excedida', () => {
    const e = validarPresupuesto({ periodo: '2026-03', presupuestoTotal: 1000, categoriasAsignadas: { 'A': 800, 'B': 500 } });
    assert.ok(e.some(m => m.includes('excede')));
  });
  it('validarPresupuesto valido no retorna errores', () => {
    const e = validarPresupuesto({ periodo: '2026-03', presupuestoTotal: 2000, categoriasAsignadas: { 'A': 800, 'B': 500 } });
    assert.strictEqual(e.length, 0);
  });
});
