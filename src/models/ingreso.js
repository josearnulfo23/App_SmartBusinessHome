// Modelo de Ingreso
class Ingreso {
  constructor(id, monto, fecha, fuente, descripcion, categoria) {
    this.id = id || Date.now().toString();
    this.monto = parseFloat(monto) || 0;
    this.fecha = fecha || new Date().toISOString().split('T')[0];
    this.fuente = fuente || '';
    this.descripcion = descripcion || '';
    this.categoria = categoria || 'Salario';
    this.createdAt = new Date().toISOString();
  }
}
module.exports = Ingreso;
