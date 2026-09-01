# Registro de Cambios (Changelog) — SmartBusinessHome

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [1.0.0] - 2026-08-31

### Añadido
- Estructura de carpetas según spec §7 (src, assets, data, tests, docs, build, dist).
- Modelos: Ingreso, Gasto, Presupuesto, Categoria.
- Config: constants, database, settings.
- Utils: formatters, validators, helpers.
- Services: dataService (JSON local), calculoService, validacionService, alertaService, exportService.
- Controllers: ingreso, gasto, presupuesto, categoria, balance, reporte, alerta (7).
- App Express con API REST completa y SPA en `src/views/layouts/main.html`.
- Assets: main.css, components.css, themes.css, ui.js, charts.js (Canvas nativo).
- Vistas modulares (ingresos, gastos, presupuesto, reportes, configuración) integradas en SPA.
- Tests: 30 casos (unit: calculo, validators, alerta, export; integración: API).
- Documentación: README, MANUAL_USUARIO, MANUAL_TECNICO, INFORME_PRUEBAS, REPORTE_DESARROLLO, REGISTRO_CAMBIOS.
- Licencia OSL-3.0.

### Corregido
- N/A — versión inicial.

### Autoría
- José Arnulfo Céspedes Albornoz (PO / Solicitante)
- Supreme Agentic Directo — equipo de 5 agentes (PO, Architect, Coder, QA, DevOps)

## [Unreleased]
- Pendiente de backlog priorizado por PO.
