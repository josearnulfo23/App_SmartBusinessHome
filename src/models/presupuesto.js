// Modelo de Presupuesto
class Presupuesto {
  constructor(id, periodo, presupuestoTotal, categoriasAsignadas) {
    this.id = id || Date.now().toString();
    this.periodo = periodo || new Date().toISOString().slice(0, 7); // YYYY-MM
    this.presupuestoTotal = parseFloat(presupuestoTotal) || 0;
    this.categoriasAsignadas = categoriasAsignadas || {}; // { categoria: monto }
    this.updatedAt = new Date().toISOString();
  }
}
module.exports = Presupuesto;
