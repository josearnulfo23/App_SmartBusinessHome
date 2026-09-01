# SmartBusinessHome 🏠💰 v2.1

![version](https://img.shields.io/badge/version-2.1.0-blue)
![license](https://img.shields.io/badge/license-OSL--3.0-green)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![tests](https://img.shields.io/badge/tests-37%2F37-brightgreen)
![db](https://img.shields.io/badge/db-SQLite-blue)

Aplicación de escritorio (Electron) y web para el **control financiero del hogar**: ingresos, gastos, presupuestos por categoría, balance, alertas, **análisis con gráficos separados**, histórico, **autenticación segura**, **administración**, persistencia **SQLite** y **exportes CSV/XLSX/PDF**.

> **Autor:** José Arnulfo Céspedes Albornoz — **v2.1** — 2026-09-01 — **Fuente de verdad:** `spec.md`

---

## Documentación

| Documento | Descripción |
|---|---|
| [Manual de Usuario](docs/MANUAL_USUARIO.md) | Guía paso a paso (login, balance, ingresos/gastos, presupuesto, categorías, histórico, análisis, alertas, config con CSV/XLSX/PDF, admin) |
| [Manual Técnico](docs/MANUAL_TECNICO.md) | Arquitectura v2.1, modelo SQLite, seguridad JWT/bcrypt, API, análisis, exports, empaquetado |
| [Manual de Instalación](docs/MANUAL_INSTALACION.md) | Requisitos, instalación web/Electron/Docker, instaladores Win/Linux/Mac |
| [Informe de Pruebas](docs/INFORME_PRUEBAS.md) | 37 tests (unit + integración con auth), exports 200 OK, tema oscuro verificado |
| [Reporte de Desarrollo](docs/REPORTE_DESARROLLO.md) | De v1.0 a v2.1 — decisiones, retos y trazabilidad |
| [Registro de Cambios](docs/REGISTRO_CAMBIOS.md) | Changelog v1.0.0 → v2.1.0 |
| [Licencia](LICENSE) | OSL-3.0 |

---

## Novedades v2.1

- **Exportes:** Gestión de datos ahora con 3 botones → 📄 **CSV** combinado, 📊 **XLSX** (3 hojas con cabeceras coloreadas, exceljs) y 📑 **PDF** (tablas + resumen, pdfkit). Endpoints `GET /api/export/csv|xlsx|pdf` (legacy `/export/ingresos|gastos|presupuestos` se mantienen).
- **Tema oscuro corregido:** contraste de botones `.btn-secondary`/`.tab` y títulos `.card h2` en oscuro — ahora legibles.
- **Análisis** (junto a Histórico): gráficos separados ingresos y gastos — barras, torta y líneas — con filtros Desde/Hasta/Categoría/Vista, segmentación y slider Zoom.
- **Animaciones** en títulos y secciones (`fadeSlideDown`, `fadeInUp`, hover KPIs).
- **Autenticación:** `login.html`, bcryptjs 10 rounds, JWT 12h, política clave, rate limit 30/5min, `POST /api/auth/reset-limit`.
- **SQLite:** 7 tablas, FK, índices, migración desde `financiero.json`, aislamiento por `usuario_id`, `app_config`.
- **Administración** (solo admin): CRUD usuarios/roles, reset clave, backups, personalización global. Admin `admin / Admin123!`.
- **Empaquetado:** Electron + electron-builder → nsis (Win), AppImage (Linux), dmg (Mac).

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 18+ (probado 22.23.2) |
| Backend | Express 4 |
| BD | SQLite `node:sqlite` (`data/database/financiero.db`) |
| Auth | `bcryptjs` + `jsonwebtoken` |
| Export | `exceljs` 4.4 + `pdfkit` 0.20 |
| Frontend | HTML5 + CSS3 + Vanilla JS + Canvas 2D |
| Desktop | Electron 30 + electron-builder 24 |
| Tests | `node:test` nativo |

---

## Inicio Rápido

```bash
git clone https://github.com/josearnulfo23/App_SmartBusinessHome.git
cd App_SmartBusinessHome
npm install
npm install-scripts approve electron   # si el registry bloquea postinstall
npm test                                # 37/37 OK
npm start                               # http://localhost:3000 → /login
# Usuario por defecto: admin / Admin123!
```

**Electron:** `npm run electron`
**Instaladores:** ver [Manual de Instalación](docs/MANUAL_INSTALACION.md) — `npm run build` / `npm run build:win`

---

## API (resumen)

Públicas: `GET /api/health`, `POST /api/auth/login|register`, `POST /api/auth/reset-limit`, `GET /api/app-config`
Protegidas (`Bearer <token>`): `/api/ingresos`, `/api/gastos`, `/api/presupuestos`, `/api/categorias`, `/api/balance`, `/api/reportes/*`, `/api/analisis`, `/api/alertas`, `/api/export/csv|xlsx|pdf` (legacy csv separados), `POST /api/backup`
Admin (`+ role=admin`): `/api/admin/usuarios`, `/api/admin/config`, `/api/admin/backups`

---

## Licencia

OSL-3.0 — ver [LICENSE](LICENSE).

## Fuente de Verdad

`spec.md` en la raíz — única especificación autorizada (v1). Las extensiones v2.0–v2.1 fueron solicitadas explícitamente por el cliente (2026-09-01).
