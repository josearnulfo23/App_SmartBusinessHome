// Modelo de Categoría
class Categoria {
  constructor(id, nombre, tipo, descripcion) {
    this.id = id || Date.now().toString();
    this.nombre = nombre || '';
    this.tipo = tipo || 'gasto'; // 'ingreso' o 'gasto'
    this.descripcion = descripcion || '';
  }
}
module.exports = Categoria;
