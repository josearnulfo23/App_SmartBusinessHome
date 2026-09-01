# SmartBusinessHome 🏠💰 v2.2 — DEPLOYED

![version](https://img.shields.io/badge/version-2.2.0-blue)
![status](https://img.shields.io/badge/status-DEPLOYED-success)
![license](https://img.shields.io/badge/license-OSL--3.0-green)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![tests](https://img.shields.io/badge/tests-37%2F37-brightgreen)
![db](https://img.shields.io/badge/db-SQLite-blue)

Aplicación de escritorio (Electron) y web para el **control financiero del hogar**: ingresos, gastos, presupuestos por categoría, balance, alertas, **análisis con gráficos separados**, histórico, **autenticación segura**, **administración**, persistencia **SQLite** y **exportes CSV/XLSX/PDF**.

> **Autor:** José Arnulfo Céspedes Albornoz — **v2.2 DEPLOYED** — 2026-09-01 — **Fuente de verdad:** `spec.md`

---

## Documentación

| Documento | Descripción |
|---|---|
| [Manual de Usuario](docs/MANUAL_USUARIO.md) | Guía paso a paso (login, balance, ingresos/gastos, presupuesto, categorías, histórico, análisis, alertas, config con CSV/XLSX/PDF, admin) |
| [Manual Técnico](docs/MANUAL_TECNICO.md) | Arquitectura v2.2, modelo SQLite, seguridad JWT/bcrypt, API, análisis, exports, empaquetado |
| [Manual de Instalación](docs/MANUAL_INSTALACION.md) | Requisitos, instalación web/Electron/Docker, instaladores Win/Linux/Mac |
| [Informe de Pruebas](docs/INFORME_PRUEBAS.md) | 37 tests (unit + integración con auth), exports 200 OK, tema oscuro verificado, persistencia |
| [Reporte de Desarrollo](docs/REPORTE_DESARROLLO.md) | De v1.0 a v2.2 — decisiones, retos y trazabilidad |
| [Registro de Cambios](docs/REGISTRO_CAMBIOS.md) | Changelog v1.0.0 → v2.2.0 |
| [Licencia](LICENSE) | OSL-3.0 |

---

## Instaladores v2.2

| Plataforma | Carpeta | Artefacto |
|---|---|---|
| Windows | `releases/Windows/` | `SmartBusinessHome Setup 2.2.0.exe` (NSIS) + portable |
| Linux | `releases/Linux/` | `SmartBusinessHome-2.2.0.AppImage` |
| macOS | `releases/Mac/` | `SmartBusinessHome-2.2.0.dmg` (o .zip si dmg no aplica en Windows) |

> Ver `releases/README.md` para instrucciones por SO.

---

## Novedades v2.2 (DEPLOYED)

- **Persistencia verificada:** `financiero.db` (72K) intacto tras reinicios, 4 usuarios de prueba (Ana/Ana123, Leo/Leo123, Patricia/Patricia123, Maikol/Maikol123) con 60 ingresos + 99 gastos + 24 presupuestos (6 meses aleatorios).
- **Instaladores:** `electron-builder` → nsis/AppImage/dmg organizados en `releases/`.
- **v2.1:** Exports CSV combinado / XLSX 3 hojas / PDF, tema oscuro contraste corregido.
- **v2.0:** Análisis separado ingresos/gastos, SQLite 7 tablas, JWT+bcrypt, Admin, animaciones.

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 18+ (probado 22.23.2) |
| Backend | Express 4 |
| BD | SQLite `node:sqlite` (`data/database/financiero.db`) — WAL, no se borra al reiniciar |
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
# Usuarios: admin / Admin123!  |  Ana/Ana123  Leo/Leo123  Patricia/Patricia123  Maikol/Maikol123
```

**Electron:** `npm run electron`
**Instaladores:** ver [Manual de Instalación](docs/MANUAL_INSTALACION.md) — `npm run build:win|linux|mac` o `npm run build`

---

## API (resumen)

Públicas: `GET /api/health`, `POST /api/auth/login|register`, `POST /api/auth/reset-limit`, `GET /api/app-config`
Protegidas (`Bearer <token>`): `/api/ingresos`, `/api/gastos`, `/api/presupuestos`, `/api/categorias`, `/api/balance`, `/api/reportes/*`, `/api/analisis`, `/api/alertas`, `/api/export/csv|xlsx|pdf`, `POST /api/backup`
Admin (`+ role=admin`): `/api/admin/usuarios`, `/api/admin/config`, `/api/admin/backups`

---

## Licencia

OSL-3.0 — ver [LICENSE](LICENSE).

## Fuente de Verdad

`spec.md` en la raíz — única especificación autorizada (v1). Las extensiones v2.0–v2.2 fueron solicitadas explícitamente por el cliente (2026-09-01).
