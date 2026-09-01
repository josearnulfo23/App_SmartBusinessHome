# Registro de Cambios (Changelog) — SmartBusinessHome

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2.2.0] - 2026-09-01 — DEPLOYED

### Estado
- **DEPLOYED** — Criterios de aceptación v2.2 al 100%. Persistencia SQLite verificada (financiero.db 72K intacto tras reinicios), 4 usuarios de prueba con datos aleatorios 6 meses.

### Añadido
- **Release v2.2:** `releases/Windows`, `releases/Linux`, `releases/Mac` con instaladores (nsis .exe, AppImage, dmg) generados vía `electron-builder`.
- **Usuarios de prueba:** Ana/Ana123, Leo/Leo123, Patricia/Patricia123, Maikol/Maikol123 — 60 ingresos ($122M) + 99 gastos ($33M) + 24 presupuestos, verificados tras reinicio.

### Cambiado
- Versión `2.1.0` → `2.2.0` (`package.json`, `src/config/settings.js`, `README`, icono 512×512 + .ico multi-res).

## [2.1.0] - 2026-09-01

### Añadido
- **Exportaciones múltiples:** `exportService` v2.1 con `exportarCombinadoCSV`, `exportarXLSX` (exceljs, 3 hojas con cabeceras coloreadas), `exportarPDF` (pdfkit, tablas + resumen) y endpoints `GET /api/export/csv|xlsx|pdf`; UI en Gestión de datos ahora con 3 botones 📄 CSV / 📊 XLSX / 📑 PDF (rutas legacy `/export/ingresos|gastos|presupuestos` se mantienen).
- **Tema oscuro — contraste corregido:** `main.css` v2.1 corrige botones `.btn-secondary`/`.tab` (fondo #3c4043, texto #e8eaed, hover #4a4e51), título `.card h2` #8ab4f8, tabla, badges y alertas con fondos oscuros de alto contraste.
- **Rate limit login:** 30 intentos / 5 min (antes 10/15), éxito resetea contador, endpoint `POST /api/auth/reset-limit`.
- **Deps:** `exceljs` 4.4.0, `pdfkit` 0.20.2.

### Corregido
- `ws1.getRow().commitRow is not a function` en XLSX (exceljs streaming API eliminada).

## [2.0.0] - 2026-09-01

### Añadido
- **Módulo Análisis** (`view-analisis`) junto a Histórico: gráficos separados para ingresos y gastos (barras, torta, líneas) + comparativo mensual, endpoint `GET /api/analisis?desde&hasta&categoria`, herramientas de manipulación (filtros Desde/Hasta/Categoría/Vista, slider Zoom, segmentación).
- **Animaciones** globales y en títulos: `fadeSlideDown`, `fadeInUp`, hover KPIs, transiciones en tabs/botones/alertas (`assets/css/main.css`).
- **Autenticación segura:** `login.html`, `authService` (bcryptjs 10 rounds, JWT 12h, política clave ≥6 con mayúscula+número), `middleware/auth` (requireAuth/requireAdmin), rate limit login, `POST /api/auth/login|register`, `GET /api/auth/me`, `POST /api/auth/change-password`.
- **Base de datos SQLite** (`node:sqlite DatabaseSync`): 7 tablas (`usuarios, categorias, ingresos, gastos, presupuestos, presupuesto_categorias, app_config`), FK, índices, migración automática desde `financiero.json`, aislamiento por `usuario_id`, seguridad y validaciones CHECK.
- **Administración solo admin:** usuario por defecto `admin / Admin123!` configurable, CRUD usuarios, reset clave, backups globales, personalización global (tema, color primario/fondo) en `app_config` (`adminController`, `GET/POST /api/admin/*`).
- **Empaquetado:** `electron/main.js` (BrowserWindow + Express), `electron-builder` targets `nsis` (Win), `AppImage` (Linux), `dmg` (Mac), `package.json.build`.
- **Gráficos:** `assets/js/charts.js` ampliado con `drawLineChart` + leyendas.
- **Documentación:** `docs/MANUAL_INSTALACION.md` nuevo, docs reorganizados en `/docs` (6 docs), `README.md` v2 con enlaces.
- **Tests:** 37 casos (22 unit + 15 integración con auth, aislamiento multiusuario, admin, análisis).

### Cambiado
- Controllers migrados de JSON a SQLite con filtro `usuario_id`.
- `main.html` reescrito v2 con Análisis, Admin, auth guard (JWT), personalización tema/colores, animaciones.
- `dataService.js` como compat layer SQLite, `backupData` guarda dump JSON + copia `.db`.
- `package.json` v2.0.0 con dependencias `bcryptjs`, `jsonwebtoken`, devDeps `electron`, `electron-builder`, scripts `electron`/`build`.
- `.gitignore` actualizado para `.db`, `-wal`, `-shm`.

### Corregido
- `datetime('now')` con comillas simples (fix `no such column "now"` en auth/presupuestos).
- Electron `postinstall` bloqueado resuelto con `npm install-scripts approve electron`.

### Autoría
- José Arnulfo Céspedes Albornoz — Supreme Agentic Directo (PO, Architect, Coder, QA, DevOps)

## [1.0.0] - 2026-08-31

### Añadido
- Estructura §7 spec, modelos, config, utils, services (data/calculo/validacion/alerta/export), 7 controllers, Express API, SPA `main.html` (8 vistas), assets CSS/JS Canvas nativo, persistencia JSON, 30 tests, docs v1, Dockerfile, OSL-3.0.

## [Unreleased]
- Backlog PO: notificaciones desktop, D3, sync nube, PWA.
