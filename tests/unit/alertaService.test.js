// tests/unit/alertaService.test.js
const assert = require('assert');
const { describe, it } = require('node:test');
const { generarAlertas, estadoPresupuesto } = require('../../src/services/alertaService');

describe('alertaService', () => {
  it('genera advertencia al 80%', () => {
    const gastos = [{ categoria: 'Alimentación', monto: 850 }];
    const pres = { categoriasAsignadas: { 'Alimentación': 1000 } };
    const alertas = generarAlertas(gastos, pres);
    assert.strictEqual(alertas.length, 1);
    assert.strictEqual(alertas[0].tipo, 'advertencia');
  });
  it('genera excedido al 100%+', () => {
    const gastos = [{ categoria: 'Alimentación', monto: 1200 }];
    const pres = { categoriasAsignadas: { 'Alimentación': 1000 } };
    const alertas = generarAlertas(gastos, pres);
    assert.strictEqual(alertas[0].tipo, 'excedido');
  });
  it('no genera alerta si por debajo de 80%', () => {
    const gastos = [{ categoria: 'Alimentación', monto: 500 }];
    const pres = { categoriasAsignadas: { 'Alimentación': 1000 } };
    assert.strictEqual(generarAlertas(gastos, pres).length, 0);
  });
  it('estadoPresupuesto clasifica correctamente', () => {
    assert.strictEqual(estadoPresupuesto(0.5), 'normal');
    assert.strictEqual(estadoPresupuesto(0.85), 'advertencia');
    assert.strictEqual(estadoPresupuesto(1.2), 'excedido');
  });
  it('sin presupuesto no genera alertas', () => {
    assert.deepStrictEqual(generarAlertas([{categoria:'A', monto:100}], null), []);
  });
});
