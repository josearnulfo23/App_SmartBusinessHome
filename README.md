# SmartBusinessHome 🏠💰

![version](https://img.shields.io/badge/version-1.0.0-blue)
![license](https://img.shields.io/badge/license-OSL--3.0-green)
![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

Aplicación de escritorio para el **control y seguimiento de las finanzas y gastos del hogar**. Registra ingresos y gastos, gestiona presupuestos por categoría, visualiza balances, genera alertas preventivas y consulta históricos — todo almacenado localmente sin dependencias en la nube.

> **Autor:** José Arnulfo Céspedes Albornoz  
> **Versión:** 1.0.0 — 2026-08-31  
> **Fuente de verdad:** `spec.md`

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Runtime | Node.js 18+ |
| Backend | Express 4 |
| Persistencia | JSON local (`data/database/financiero.json`) |
| Frontend | HTML5 + CSS3 + Vanilla JS + Canvas API |
| Tests | `node:test` nativo |
| Gráficos | Canvas 2D nativo (sin dependencias externas) |

## Prerrequisitos

- Node.js 18 o superior y npm 9+ (`node -v && npm -v`)
- Windows 10+, macOS 10.14+ o Linux (cualquier distro moderna)
- Resolución mínima 1366×768

## Instalación Rápida

```bash
# 1. Clonar (ver sección Git/GitHub abajo)
git clone https://github.com/<usuario>/SmartBusinessHome.git
cd SmartBusinessHome

# 2. Instalar dependencias
npm install

# 3. Iniciar la aplicación
npm start
# Abre http://localhost:3000 en el navegador

# 4. Ejecutar pruebas
npm test
```

## Estructura del Proyecto

```
control-financiero-hogar/
├── src/
│   ├── main/app.js              # Punto de entrada Express
│   ├── models/                  # Ingreso, Gasto, Presupuesto, Categoria
│   ├── controllers/             # 7 controladores (ingreso, gasto, presupuesto, categoria, balance, reporte, alerta)
│   ├── services/                # dataService, calculoService, validacionService, alertaService, exportService
│   ├── utils/                   # formatters, validators, helpers
│   ├── config/                  # constants, database, settings
│   └── views/layouts/main.html  # SPA principal
├── assets/css|js                # Estilos y scripts del cliente
├── data/database|backups|exports
├── tests/unit|integration
└── docs/
```

## API Principal

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/ingresos` | Listar / crear ingresos |
| PUT/DELETE | `/api/ingresos/:id` | Actualizar / eliminar |
| GET/POST | `/api/gastos` | Gastos |
| GET/POST | `/api/presupuestos` | Presupuestos |
| GET/POST | `/api/categorias` | Categorías |
| GET | `/api/balance?periodo=YYYY-MM` | Balance del periodo |
| GET | `/api/reportes/categorias` | Análisis por categoría |
| GET | `/api/reportes/historico` | Histórico / comparación |
| GET | `/api/alertas?periodo=YYYY-MM` | Alertas 80% / 100% |
| GET | `/api/export/*` | Exportar CSV |
| POST | `/api/backup` | Crear respaldo |

## Licencia

OSL-3.0 — ver [LICENSE](./LICENSE).
