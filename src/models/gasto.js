// Modelo de Gasto
class Gasto {
  constructor(id, monto, fecha, categoria, descripcion) {
    this.id = id || Date.now().toString();
    this.monto = parseFloat(monto) || 0;
    this.fecha = fecha || new Date().toISOString().split('T')[0];
    this.categoria = categoria || 'Alimentación';
    this.descripcion = descripcion || '';
    this.createdAt = new Date().toISOString();
  }
}
module.exports = Gasto;
