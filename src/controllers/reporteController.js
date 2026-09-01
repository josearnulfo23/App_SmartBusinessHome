// src/controllers/reporteController.js v2.0 - SQLite
const { getDb } = require('../services/db');
const calculoService = require('../services/calculoService');

function reporteCategorias(req, res) {
  const periodo = req.query.periodo || new Date().toISOString().slice(0,7);
  const db = getDb();
  const gastos = db.prepare('SELECT * FROM gastos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%');
  const pres = db.prepare('SELECT * FROM presupuestos WHERE usuario_id=? AND periodo=?').get(req.user.id, periodo);
  let presupuesto = null;
  let categoriasAsignadas = {};
  if (pres) {
    const cats = db.prepare('SELECT categoria, monto FROM presupuesto_categorias WHERE presupuesto_id=?').all(pres.id);
    cats.forEach(c=> categoriasAsignadas[c.categoria]=c.monto);
    presupuesto = { id: String(pres.id), periodo: pres.periodo, presupuestoTotal: pres.presupuesto_total, categoriasAsignadas };
  }
  // para calculoService usar objetos {categoria, monto}
  const porCategoria = calculoService.gastosPorCategoria(gastos.map(g=>({categoria:g.categoria, monto:g.monto})));
  const porcentajes = calculoService.porcentajePorCategoria(gastos.map(g=>({categoria:g.categoria, monto:g.monto})));
  const ejecucion = presupuesto ? calculoService.ejecucionPresupuesto(gastos.map(g=>({categoria:g.categoria, monto:g.monto})), categoriasAsignadas) : {};
  res.json({ periodo, porCategoria, porcentajes, ejecucion, totalGastos: calculoService.totalGastos(gastos.map(g=>({monto:g.monto}))), presupuesto });
}

function reporteHistorico(req, res) {
  const { periodo, comparar } = req.query;
  const db = getDb();
  function resumen(p) {
    const ing = db.prepare('SELECT monto FROM ingresos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, p+'%');
    const gas = db.prepare('SELECT monto, categoria FROM gastos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, p+'%');
    const totalIngresos = calculoService.totalIngresos(ing.map(i=>({monto:i.monto})));
    const totalGastos = calculoService.totalGastos(gas.map(g=>({monto:g.monto})));
    return { periodo: p, totalIngresos, totalGastos, saldo: totalIngresos-totalGastos, porCategoria: calculoService.gastosPorCategoria(gas.map(g=>({categoria:g.categoria, monto:g.monto})) ) };
  }
  if (periodo) {
    const actual = resumen(periodo);
    if (comparar) return res.json({ actual, comparacion: resumen(comparar) });
    return res.json(actual);
  }
  const periodosIng = db.prepare("SELECT DISTINCT substr(fecha,1,7) as p FROM ingresos WHERE usuario_id=?").all(req.user.id).map(r=>r.p);
  const periodosGas = db.prepare("SELECT DISTINCT substr(fecha,1,7) as p FROM gastos WHERE usuario_id=?").all(req.user.id).map(r=>r.p);
  const periodos = [...new Set([...periodosIng, ...periodosGas])].sort();
  res.json({ periodos, resumenes: periodos.map(p=> resumen(p)) });
}

function listarTransacciones(req, res) {
  const db = getDb();
  const periodo = req.query.periodo;
  let ingresos = periodo ? db.prepare('SELECT * FROM ingresos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%') : db.prepare('SELECT * FROM ingresos WHERE usuario_id=?').all(req.user.id);
  let gastos = periodo ? db.prepare('SELECT * FROM gastos WHERE usuario_id=? AND fecha LIKE ?').all(req.user.id, periodo+'%') : db.prepare('SELECT * FROM gastos WHERE usuario_id=?').all(req.user.id);
  let transacciones = [
    ...ingresos.map(i=>({ id:String(i.id), monto:i.monto, fecha:i.fecha, categoria:i.categoria, descripcion:i.descripcion, fuente:i.fuente, tipo:'ingreso' })),
    ...gastos.map(g=>({ id:String(g.id), monto:g.monto, fecha:g.fecha, categoria:g.categoria, descripcion:g.descripcion, tipo:'gasto' }))
  ];
  transacciones.sort((a,b)=> new Date(b.fecha)-new Date(a.fecha));
  res.json(transacciones);
}

// Nuevo: análisis agregado para módulo Análisis
function analisisCompleto(req, res) {
  const db = getDb();
  // Rango opcional ?desde=YYYY-MM&hasta=YYYY-MM, tipo filtro, categorías
  let desde = req.query.desde || null;
  let hasta = req.query.hasta || null;
  const categoria = req.query.categoria || null;
  // Construir where dinámico
  function whereClause(alias) {
    let c = 'usuario_id=?';
    const p = [req.user.id];
    if (desde) { c += ` AND fecha >= ?`; p.push(desde+'-01'); }
    if (hasta) { c += ` AND fecha <= ?`; p.push(hasta+'-31'); }
    if (categoria) { c += ` AND categoria = ?`; p.push(categoria); }
    return { clause: c, params: p };
  }
  const iWhere = whereClause('ingresos');
  const gWhere = whereClause('gastos');
  const ingresos = db.prepare(`SELECT * FROM ingresos WHERE ${iWhere.clause} ORDER BY fecha`).all(...iWhere.params);
  const gastos = db.prepare(`SELECT * FROM gastos WHERE ${gWhere.clause} ORDER BY fecha`).all(...gWhere.params);
  // Serie mensual
  const mesesSet = [...new Set([...ingresos, ...gastos].map(r=> r.fecha.slice(0,7)))].sort();
  const serieMensual = mesesSet.map(m=>{
    const ingM = ingresos.filter(r=> r.fecha.startsWith(m)).reduce((s,r)=> s+Number(r.monto),0);
    const gasM = gastos.filter(r=> r.fecha.startsWith(m)).reduce((s,r)=> s+Number(r.monto),0);
    return { periodo:m, ingresos:ingM, gastos:gasM, saldo:ingM-gasM };
  });
  const porCatIngresos = calculoService.gastosPorCategoria(ingresos.map(r=>({categoria:r.categoria, monto:r.monto})));
  const porCatGastos = calculoService.gastosPorCategoria(gastos.map(r=>({categoria:r.categoria, monto:r.monto})));
  const totalIngresos = ingresos.reduce((s,r)=> s+Number(r.monto),0);
  const totalGastos = gastos.reduce((s,r)=> s+Number(r.monto),0);
  res.json({ filtros:{desde, hasta, categoria}, totalIngresos, totalGastos, saldo: totalIngresos-totalGastos, serieMensual, porCatIngresos, porCatGastos, ingresos, gastos });
}

module.exports = { reporteCategorias, reporteHistorico, listarTransacciones, analisisCompleto };
