# Manual Técnico — SmartBusinessHome

## 1. Arquitectura General

```
Vista (SPA main.html + assets/js) → Controllers → Services → Models → dataService (JSON)
                                   ← Respuesta JSON / HTML ←
```

- **DDD táctico**: `models/` y `services/calculoService` forman el núcleo de dominio sin dependencias de UI ni de Express.
- **SDD**: descomposición Top-Down según la jerarquía de funciones del spec (9 módulos, §6).
- **TDD**: tests unitarios e integración con `node:test` antes de refactors.

## 2. Árbol Modular (SDD)

```
src/
├── main/app.js               # Express, rutas API, static, SPA fallback
├── models/                   # ingreso.js, gasto.js, presupuesto.js, categoria.js
├── controllers/              # 7 controladores (capa de coordinación)
├── services/                 # dataService, calculoService, validacionService, alertaService, exportService
├── utils/                    # formatters, validators, helpers
├── config/                   # constants, database, settings
└── views/layouts/main.html   # SPA 8 vistas + tabs
assets/
├── css/main.css, components.css, themes.css
└── js/ui.js, charts.js
data/database/financiero.json
```

## 3. Modelo de Datos

### Ingreso
`{ id, monto:number, fecha:YYYY-MM-DD, categoria, fuente, descripcion, createdAt }`

### Gasto
`{ id, monto:number, fecha:YYYY-MM-DD, categoria, descripcion, createdAt }`

### Presupuesto
`{ id, periodo:YYYY-MM, presupuestoTotal:number, categoriasAsignadas:{ [categoria]: number }, updatedAt }`

### Categoria (personalizada)
`{ id, nombre, tipo:ingreso|gasto, descripcion }`

Predefinidas: `CATEGORIAS_INGRESO_PREDEFINIDAS` (5) y `CATEGORIAS_GASTO_PREDEFINIDAS` (8) en `constants.js`.

### Almacenamiento

`data/database/financiero.json` → `{ ingresos:[], gastos:[], presupuestos:[], categorias:[] }`. Operaciones atómicas vía `loadData()` / `saveData()` en `dataService`.

## 4. Flujo de Datos

1. SPA hace `fetch('/api/...')`.
2. Controller valida con `validacionService`, delega a `dataService`.
3. `calculoService` y `alertaService` computan derivados (balance, por categoría, alertas).
4. Respuesta JSON; SPA actualiza DOM y gráficos Canvas.

## 5. Validaciones

- `validators.js`: monto >0, fecha válida, categoría obligatoria, descripción ≤200.
- `validacionService`: presupuesto con `YYYY-MM`, suma por categorías ≤ total.
- Rechazo con `400` y `{ errores: [...] }`.

## 6. Cálculos

`calculoService`: `totalIngresos`, `totalGastos`, `balance`, `gastosPorCategoria`, `porcentajePorCategoria`, `ejecucionPresupuesto`, `filtrarPorPeriodo`.

## 7. Alertas

`alertaService.generarAlertas(gastos, presupuesto)` — umbrales `0.80` (warning) y `1.00` (error) de `constants.js`.

## 8. API

Ver README para tabla completa. Todas las respuestas son JSON salvo `/api/export/*` (CSV) y `/` (HTML). Health: `GET /api/health`.

## 9. Seguridad y Confiabilidad

- Datos locales, sin autenticación (usuario único en el equipo).
- Validación de entrada en controller + service.
- Respaldo vía `POST /api/backup` y copia manual de `financiero.json`.

## 10. Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| Express + JSON file | Simplicidad, sin instalación de BD, cumple spec §7.2 |
| Canvas nativo | Cero dependencias extra, cumple requisito de gráficos sin librerías pesadas |
| SPA en un solo HTML | Operaciones en ≤3 clics (RNF-01.2), sin framework SPA |
| `node:test` | Sin dependencias de test, Node 18+ nativo |

## 11. Extensibilidad

Agregar módulo: nuevo `controller` + `service` + ruta en `app.js` + sección en `main.html`. El dominio permanece desacoplado.
