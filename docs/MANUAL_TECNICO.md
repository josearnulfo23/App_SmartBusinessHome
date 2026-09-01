# Manual Técnico — SmartBusinessHome v2.0

> Versión 2.0 — 2026-09-01 — Autor: José Arnulfo Céspedes Albornoz

## 1. Arquitectura v2.0

```
SPA (main.html + assets/js + Canvas) ──JWT──▶ Express (src/main/app.js)
        │                                          ├── middleware/auth.js (requireAuth, requireAdmin)
        │                                          ├── controllers (8): auth, ingreso, gasto, presupuesto, categoria, balance, reporte, alerta, admin
        │                                          ├── services: db.js, authService, dataService, calculoService, validacionService, alertaService, exportService
        │                                          ├── config: auth, database, settings, constants
        │                                          └── Electron wrapper (electron/main.js)
        ▼
   SQLite (node:sqlite DatabaseSync) — data/database/financiero.db
   Tablas: usuarios, categorias, ingresos, gastos, presupuestos, presupuesto_categorias, app_config
```

- **DDD:** `services/calculoService` y entidades puras sin dependencia de Express.
- **SDD:** descomposición Top-Down §6 spec, 9 módulos + nuevo Análisis y Admin.
- **TDD:** 37 tests (`node:test` nativo).

## 2. Modelo de Datos (SQLite)

### ER resumido

```
usuarios 1──* ingresos
usuarios 1──* gastos
usuarios 1──* presupuestos 1──* presupuesto_categorias
usuarios 1──* categorias (personalizadas)
app_config (clave→valor) independiente
```

### DDL

```sql
usuarios(id PK, username UNIQUE COLLATE NOCASE, password_hash, display_name, role CHECK admin|user, created_at, updated_at)
categorias(id PK, nombre, tipo CHECK ingreso|gasto, descripcion, usuario_id FK, UNIQUE(nombre,tipo,usuario_id))
ingresos(id PK, monto CHECK >0, fecha TEXT YYYY-MM-DD, categoria, fuente, descripcion, usuario_id FK)
gastos(id PK, monto CHECK >0, fecha TEXT, categoria, descripcion, usuario_id FK)
presupuestos(id PK, periodo TEXT YYYY-MM, presupuesto_total, usuario_id FK, UNIQUE(periodo,usuario_id))
presupuesto_categorias(id PK, presupuesto_id FK CASCADE, categoria, monto, UNIQUE(presupuesto_id,categoria))
app_config(clave PK, valor, descripcion)
INDEX idx_ingresos_usuario_fecha, idx_gastos_usuario_fecha, idx_gastos_categoria
```

- `node:sqlite` con `DatabaseSync`, `PRAGMA journal_mode=WAL`, `foreign_keys=ON`.
- Migración automática desde `financiero.json` legacy si `financiero.db` está vacío.
- `app_config` guarda `tema`, `colorPrimario`, `colorFondo`.

## 3. Seguridad

| Mecanismo | Detalle |
|---|---|
| Hash de clave | `bcryptjs` 10 rounds |
| JWT | `jsonwebtoken`, secret en `config/auth.js` (env `JWT_SECRET`), expira 12 h, payload `{id, username, role, displayName}` |
| Política de clave | ≥6 chars, ≥1 mayúscula, ≥1 número |
| Auth middleware | `requireAuth` verifica `Authorization: Bearer`, `requireAdmin` verifica `role==='admin'` |
| Rate limit login | 10 intentos / 15 min por IP (memoria) |
| Headers | `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` |
| Aislamiento por usuario | Todas las queries filtran `usuario_id = req.user.id` |
| Admin por defecto | `admin / Admin123!` creado en `ensureAdminUser()` si no existe |

## 4. API v2.0

### Públicas
| Método | Ruta | Notas |
|---|---|---|
| GET | `/api/health` | |
| POST | `/api/auth/login` | rate limit |
| POST | `/api/auth/register` | crea `user`; solo admin puede crear `admin` |
| GET | `/api/app-config` | tema/colores |

### Protegidas (`Authorization: Bearer <token>`)
| Método | Ruta |
|---|---|
| GET/POST | `/api/auth/me`, `/api/auth/change-password` |
| CRUD | `/api/ingresos`, `/api/gastos`, `/api/presupuestos`, `/api/categorias` |
| GET | `/api/balance`, `/api/reportes/categorias`, `/api/reportes/historico`, `/api/reportes/transacciones`, `/api/analisis`, `/api/alertas`, `/api/export/*`, `POST /api/backup` |

### Admin (`+ requireAdmin`)
`GET/POST /api/admin/usuarios`, `PUT/DELETE /api/admin/usuarios/:id`, `POST /api/admin/usuarios/:id/reset-password`, `GET/POST /api/admin/config`, `GET /api/admin/backups`, `POST /api/admin/backup`

## 5. Módulo Análisis

Endpoint `GET /api/analisis?desde=YYYY-MM&hasta=YYYY-MM&categoria=X` retorna `{ totalIngresos, totalGastos, saldo, serieMensual:[{periodo,ingresos,gastos,saldo}], porCatIngresos, porCatGastos }`. Frontend dibuja con `assets/js/charts.js`:

- `drawPieChart(id, data)` con leyenda
- `drawBarChart(id, labels, values)` con barras coloreadas
- `drawLineChart(id, labels, series)` para tendencias mensuales

Herramientas: filtros Desde/Hasta/Categoría/Vista, slider Zoom (CSS `transform: scale`), checkbox animación.

## 6. Animaciones

Definidas en `assets/css/main.css`: `fadeSlideDown` (header), `fadeIn` (títulos), `fadeInUp` (secciones), `pulse`, hover KPIs, `transform` en botones/tabs, `transition` en background.

## 7. Empaquetado

- **Electron:** `electron/main.js` inicia Express y abre `BrowserWindow` a `http://localhost:3000`.
- **electron-builder:** `package.json.build` con `appId`, `productName`, targets `nsis` (win), `AppImage` (linux), `dmg` (mac).

## 8. Decisiones v2.0

| Tema | Decisión | Alternativa |
|---|---|---|
| BD | SQLite `node:sqlite` (nativo Node 22, sin deps) | better-sqlite3 / sql.js |
| Auth | JWT stateless | sessions en DB |
| Gráficos | Canvas nativo | Chart.js |
| Empaquetado | Electron + builder | Tauri |

## 9. Extensibilidad

Nuevo módulo: controller + ruta en `app.js` + sección en `main.html` + test en `tests/integration`. El dominio sigue desacoplado de UI y persistencia.
