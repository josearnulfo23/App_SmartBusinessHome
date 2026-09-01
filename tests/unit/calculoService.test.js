// tests/unit/calculoService.test.js
const assert = require('assert');
const { describe, it } = require('node:test');
const calculo = require('../../src/services/calculoService');

describe('calculoService', () => {
  it('totalIngresos suma correctamente', () => {
    assert.strictEqual(calculo.totalIngresos([{monto:100},{monto:200}]), 300);
    assert.strictEqual(calculo.totalIngresos([]), 0);
  });
  it('totalGastos suma correctamente', () => {
    assert.strictEqual(calculo.totalGastos([{monto:50},{monto:150}]), 200);
  });
  it('balance calcula superavit y deficit', () => {
    assert.strictEqual(calculo.balance([{monto:1000}], [{monto:400}]), 600);
    assert.strictEqual(calculo.balance([{monto:100}], [{monto:500}]), -400);
  });
  it('gastosPorCategoria agrupa correctamente', () => {
    const g = [{categoria:'Alimentación', monto:100},{categoria:'Alimentación', monto:50},{categoria:'Transporte', monto:200}];
    const map = calculo.gastosPorCategoria(g);
    assert.strictEqual(map['Alimentación'], 150);
    assert.strictEqual(map['Transporte'], 200);
  });
  it('porcentajePorCategoria calcula proporciones', () => {
    const g = [{categoria:'A', monto:75},{categoria:'B', monto:25}];
    const p = calculo.porcentajePorCategoria(g);
    assert.ok(Math.abs(p['A'] - 0.75) < 0.001);
    assert.ok(Math.abs(p['B'] - 0.25) < 0.001);
  });
  it('porcentajePorCategoria con total 0 retorna vacio', () => {
    assert.deepStrictEqual(calculo.porcentajePorCategoria([]), {});
  });
  it('ejecucionPresupuesto calcula porcentaje y restante', () => {
    const gastos = [{categoria:'Alimentación', monto:800}];
    const pres = { 'Alimentación': 1000, 'Transporte': 500 };
    const ej = calculo.ejecucionPresupuesto(gastos, pres);
    assert.strictEqual(ej['Alimentación'].porcentaje, 0.8);
    assert.strictEqual(ej['Alimentación'].restante, 200);
    assert.strictEqual(ej['Transporte'].ejecutado, 0);
  });
  it('filtrarPorPeriodo filtra por YYYY-MM', () => {
    const items = [{fecha:'2026-03-15'},{fecha:'2026-04-01'},{fecha:'2026-03-20'}];
    assert.strictEqual(calculo.filtrarPorPeriodo(items, '2026-03').length, 2);
  });
});
