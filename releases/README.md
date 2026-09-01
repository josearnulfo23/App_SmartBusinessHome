# Releases — SmartBusinessHome

Instaladores generados vía `electron-builder` (v2.2.0 DEPLOYED).

## Contenido

| Carpeta | Artefacto(s) | Tamaño aprox | Cómo instalar |
|---|---|---|---|
| `Windows/` | `SmartBusinessHome Setup 2.2.0.exe` (NSIS) | ~82 MB | Doble clic → Siguiente → Instalar → Ejecutar. Requiere Windows 10+. |
| `Linux/` | `smart-business-home-2.2.0.tar.gz` (+ `linux-unpacked/`) | ~107 MB | `tar -xzf smart-business-home-2.2.0.tar.gz && ./smart-business-home` o copiar `linux-unpacked` |
| `Mac/` | `README.md` + (en Mac: `SmartBusinessHome-2.2.0.dmg`) | — | Ver `Mac/README.md` |

## Usuarios de prueba (persistentes en financiero.db)
- `Ana` / `Ana123`
- `Leo` / `Leo123`
- `Patricia` / `Patricia123`
- `Maikol` / `Maikol123`
- `admin` / `Admin123!` (admin)

Datos: 62 ingresos + 100 gastos + 24 presupuestos (6 meses 2026-04 a 2026-09).

## Verificación tras instalación
1. Abrir la app → /login → probar cada usuario.
2. Cambiar Periodo 2026-04..2026-09 → Balance/Análisis deben mostrar datos aislados por usuario.
3. Reiniciar la app/PC → los datos persisten (SQLite `financiero.db`).
4. Config → Gestión de datos → Probar CSV/XLSX/PDF (200 OK).
5. Tema Oscuro → verificar contraste de botones.

## Generación local
```bash
npm run build:win    # Windows .exe
npm run build:linux  # Linux tar.gz (+ dir)
npm run build:mac    # macOS dmg (solo en Mac)
npm run build        # todos (solo el del host funciona sin cross-compile)
```
