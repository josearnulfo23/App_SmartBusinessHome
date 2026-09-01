# Informe de Pruebas — SmartBusinessHome

## 1. Resumen Ejecutivo

- **Total tests:** 30
- **Suites:** 5
- **Aprobados:** 30 (100%)
- **Fallidos:** 0
- **Comando:** `npm test` → `node --test tests/**/*.js`
- **Fecha:** 2026-08-31

## 2. Cobertura por Suite

| Suite | Tests | Estado |
|-------|-------|--------|
| API integración | 8 | ✅ |
| alertaService | 5 | ✅ |
| calculoService | 8 | ✅ |
| exportService | 3 | ✅ |
| validators | 6 | ✅ |

## 3. Pruebas Unitarias

### calculoService (8)
- Suma de ingresos/gastos, balance superávit/déficit, agrupación por categoría, porcentajes, ejecución de presupuesto (porcentaje y restante), filtro por periodo.

### validators / validacionService (6)
- Monto 0/negativo/no numérico, fecha vacía/inválida, transacción con múltiples errores, periodo con formato inválido, suma de categorías excedida, presupuesto válido.

### alertaService (5)
- Advertencia al 80%, excedido al 100%+, sin alerta por debajo de 80%, clasificación de estado, sin presupuesto → sin alertas.

### exportService (3)
- Cabecera y filas CSV, escape de comas y comillas, exportación de gastos.

## 4. Pruebas de Integración (API)

Servidor Express en puerto aleatorio, DB temporal en `data/database/financiero.json` (respaldada y restaurada).

| Caso | Verificación |
|------|--------------|
| Health check | `GET /api/health` 200 |
| CRUD ingresos | POST → GET filtrado → PUT → DELETE |
| Validación ingreso | POST con monto negativo → 400 |
| CRUD gastos + alertas | Presupuesto + gasto al 80%+ → alertas + balance |
| Categorías CRUD | Listar ≥8, crear, eliminar personalizada |
| Reportes | Categorías y transacciones por periodo |
| Histórico | Consulta por periodo |
| Export CSV | Content-Type text/csv |

## 5. Pruebas de Robustez (Caja Negra / Límites)

- Monto 0, negativo, NaN, >999M → rechazado.
- Fecha vacía, inválida → rechazado.
- Descripción >200 chars → rechazado.
- Categoría vacía → rechazado.
- Presupuesto con suma > total → rechazado.
- Gastos sin presupuesto → alertas vacías (no falso positivo).
- Periodo sin datos → respuestas vacías sin error 500.

## 6. Conclusión

100% de pruebas aprobadas. La aplicación satisface los criterios de aceptación de `spec.md` y los RNF de rendimiento y confiabilidad para el alcance definido.
