# Reporte de Desarrollo — SmartBusinessHome

## 1. Proceso

Desarrollo dirigido por `spec.md` como única fuente de verdad. Flujo descendente PO → Architect → Coder → QA → DevOps.

| Fase | Actividad |
|------|-----------|
| Requisitos | Descomposición de spec en HU y RF/RNF, matriz UAT |
| Arquitectura | SDD + DDD, árbol de carpetas §7, contratos JSON |
| Codificación | TDD: tests primero, código mínimo, refactorización |
| QA | 30 tests (unit + integración), validación de cobertura |
| DevOps | Empaquetado npm, backup, export, documentación |

## 2. Decisiones de Diseño

| Tema | Decisión | Alternativa descartada |
|------|----------|------------------------|
| Persistencia | JSON local + dataService | SQLite (sobrecarga para 10k registros) |
| Frontend | SPA vanilla + Canvas | React/Vue (over-engineering para spec) |
| Gráficos | Canvas 2D nativo | Chart.js (dependencia innecesaria) |
| Tests | `node:test` | Jest (dependencia extra) |
| Servidor | Express | http nativo (más verboso sin beneficio) |

## 3. Retos Algorítmicos

1. **Ejecución de presupuesto** — categorías con gasto pero sin presupuesto asignado: se representan con `Infinity` y estado coherente.
2. **Filtro histórico** — periodos como `YYYY-MM` permiten `startsWith` sin parseo de fechas costoso.
3. **Alertas** — umbrales configurables en `constants.js`, generación pura sin estado.

## 4. Trazabilidad spec.md

| Sección spec | Artefacto |
|--------------|-----------|
| §2 Historias de usuario | Controllers + vistas SPA |
| §3 Casos de uso | Rutas API + validaciones |
| §4 RF-01..10 | Services + controllers + tests |
| §5 RNF | Persistencia local, validación, performance |
| §6 Jerarquía funciones | Tabs SPA (9 módulos) |
| §7 Estructura carpetas | Árbol implementado 1:1 |

## 5. Convenciones

- Código en español para dominio (ingreso, gasto, presupuesto) y en inglés para infraestructura.
- Comentarios de trazabilidad en cada módulo.
- Sin `goto`, solo secuencias, selecciones e iteraciones.

## 6. Pendientes / Mejoras Futuras (requieren autorización PO)

- Autenticación multiusuario
- Base de datos SQLite para >10k transacciones
- Notificaciones de escritorio nativas
- Empaquetado Electron para instalador .exe/.dmg
