# Informe de Pruebas — SmartBusinessHome v2.0

> 2026-09-01 — 37 tests, 5 suites, 100% aprobados — `npm test` → `node --test tests/**/*.js`

## 1. Resumen

| Métrica | Valor |
|---|---|
| Total tests | 37 |
| Suites | 5 (API integración v2.0, alertaService, calculoService, exportService, validators) |
| Aprobados | 37 |
| Fallidos | 0 |
| Duración | ~2.7 s |

## 2. Suites

| Suite | Tests | Cubre |
|---|---|---|
| API integración v2.0 | 15 | auth, CRUD ingresos/gastos, presupuestos, categorías, reportes, análisis, aislamiento por usuario, admin, export, cambio de clave |
| alertaService | 5 | umbrales 80%/100%, clasificación, sin presupuesto |
| calculoService | 8 | sumas, balance, agrupación, porcentajes, ejecución presupuesto, filtro periodo |
| exportService | 3 | CSV cabecera, escape, exportación |
| validators | 6 | monto, fecha, transacción, presupuesto inválido/suma excedida/válido |

## 3. Integración v2.0 — Detalle

Base SQLite en memoria/archivo temporal, servidor en puerto aleatorio, token JWT.

| Caso | Verifica |
|---|---|
| health sin auth | 200 |
| protegidos sin token | 401 |
| login inválido | 401 |
| registro usuario nuevo | 201 + login |
| clave débil | 400 (política mayúscula+número) |
| CRUD ingresos con auth | POST→GET→PUT→DELETE + validación 400 |
| CRUD gastos + presupuesto + alertas + balance | alertas por categoría, balance |
| categorías CRUD | listar ≥8, crear, eliminar |
| reportes y análisis | categorías, transacciones, histórico, `/api/analisis` con serieMensual |
| aislamiento por usuario | testuser no ve datos de admin y viceversa |
| admin solo admin | user →403, admin →200 |
| admin crear/eliminar usuario | ciclo completo |
| export CSV | content-type text/csv |
| cambio de clave | cambio y reversión, fix datetime('now') comillas |

## 4. Robustez / Límites

- Monto 0/negativo/NaN/>999M → 400
- Fecha vacía/inválida → 400
- Descripción >200 → 400
- Presupuesto suma>total → 400
- Sin presupuesto → alertas vacías
- Periodo sin datos → JSON vacío sin 500
- Aislamiento multiusuario verificado

## 5. Conclusión

100% aprobado. Criterios spec.md + extensiones v2.0 (auth, análisis, admin, SQLite) cubiertos. Listo para entrega.
