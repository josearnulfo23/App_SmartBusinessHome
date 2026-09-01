# Manual de Instalación — SmartBusinessHome v2.0

> Versión 2.0 — 2026-09-01 — Autor: José Arnulfo Céspedes Albornoz

## 1. Requisitos Previos

| Requisito | Mínimo | Recomendado |
|---|---|---|
| Node.js | 18.0 | 22.x |
| npm | 9.0 | 10.x |
| SO | Windows 10 / macOS 10.14 / Linux (Ubuntu 20+ / Fedora 36+ / Debian 11+) | — |
| RAM | 512 MB libre | 1 GB |
| Disco | 300 MB + datos | 1 GB |
| Resolución | 1366×768 | 1920×1080 |
| Navegador (modo web) | Chrome 100+, Edge 100+, Firefox 100+ | — |

Verificar: `node -v` y `npm -v`.

## 2. Instalación Rápida (modo desarrollo / web)

```bash
git clone https://github.com/josearnulfo23/App_SmartBusinessHome.git
cd App_SmartBusinessHome
npm install
# Aprobar postinstall de Electron si lo bloquea el registry
npm install-scripts approve electron
npm test          # debe dar 37/37 OK
npm start
# Abrir http://localhost:3000 → redirige a /login
# Usuario por defecto: admin / Admin123!
```

Cambiar `JWT_SECRET` para producción:

```bash
JWT_SECRET="tu-clave-larga-aleatoria" PORT=3000 npm start
```

## 3. Modo Escritorio (Electron)

```bash
npm run electron
# Abre ventana nativa 1280×800 cargando http://localhost:3000
# DevTools abierto solo si no está empaquetado
```

## 4. Construir Instaladores (empaquetado)

**Prerrequisitos:**

- Windows: Windows 10+, sin requisitos extra para `nsis`.
- Linux: `fakeroot`/`rpm` si se quiere `.rpm`/`AppImage` ya incluido; para AppImage no se requiere firma.
- macOS: Xcode Command Line Tools (`xcode-select --install`), para `dmg` sin firma funciona; para firma/notarización configurar `APPLE_ID`.

**Comandos:**

```bash
# Todos los targets según SO (solo el del host actual funciona sin cross-compile)
npm run build              # --win --linux --mac (requiere dependencias de cada SO)

# Solo Windows (desde Windows)
npm run build:win          # genera dist/SmartBusinessHome-2.0.0-*.exe (NSIS)

# Manual por plataforma
npx electron-builder --win              # NSIS .exe
npx electron-builder --linux            # AppImage
npx electron-builder --mac              # dmg (solo en macOS)
```

**Salida:** `dist/` (ver `package.json.build`):

- `SmartBusinessHome Setup 2.0.0.exe` (Windows NSIS, instalador con opción de directorio)
- `SmartBusinessHome-2.0.0.AppImage` (Linux)
- `SmartBusinessHome-2.0.0.dmg` (macOS)

Instalar el artefacto correspondiente y ejecutar. La primera ejecución crea `data/database/financiero.db` y usuario `admin`.

## 5. Docker (opcional)

```bash
docker compose up --build
# http://localhost:3000
```

Para persistencia, el volumen `./data` se monta al contenedor (ver `docker-compose.yml`).

## 6. Estructura tras instalación

```
data/database/financiero.db      # BD SQLite (WAL)
data/backups/backup-*.json       # Respaldos JSON + .db
docs/                            # Documentación
```

## 7. Usuarios y Primer Inicio

1. Abrir la app (web o Electron).
2. En `/login` ingresar `admin` / `Admin123!`.
3. Ir a Admin → Usuarios para crear cuentas `user` o `admin` adicionales.
4. Cambiar la clave del admin en Config → Cambiar clave o Admin → Reset.

## 8. Actualización

```bash
git pull
npm install
npm test
# La BD migra automáticamente; si vienes de v1 JSON se convierte a SQLite la primera vez
```

## 9. Desinstalación

- **Instalador NSIS:** Panel de Control → Programas → Desinstalar SmartBusinessHome.
- **AppImage/dmg:** borrar el archivo y la carpeta `data/` si no deseas conservar datos.
- **Modo web:** `rm -rf node_modules` y borrar el clon.

## 10. Solución de Problemas

| Problema | Causa / Solución |
|---|---|
| `Electron failed to install` | Ejecutar `npm install-scripts approve electron` y `npm rebuild electron` |
| Puerto 3000 ocupado | `PORT=3001 npm start` |
| `401 No autenticado` | Sesión expirada (12 h), volver a `/login` |
| `no such column "now"` | Actualizar a código v2.0.0+ (fix comillas en `datetime('now')`) |
| Datos v1 no aparecen | Verificar que `financiero.json` existía antes del primer arranque v2; revisar `financiero.json.migrated-*` |

## 11. Soporte

Incluir: versión (`/api/health`), SO, pasos y mensaje de error. Contacto: repositorio GitHub Issues.
