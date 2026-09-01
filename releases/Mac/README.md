# macOS — SmartBusinessHome v2.2

El instalador macOS (`dmg`/`zip`) **solo puede construirse en macOS** (limitación de electron-builder).

## En Windows/Linux (situación actual)
El build con `npx electron-builder --mac` falla con:
> Build for macOS is supported only on macOS

Esto es esperado y documentado en https://electron.build/multi-platform-build

## Cómo generar el instalador macOS
En un Mac con Node 18+:

```bash
git clone https://github.com/josearnulfo23/App_SmartBusinessHome.git
cd App_SmartBusinessHome
npm install
npm install-scripts approve electron
npm run build:mac   # genera dist/SmartBusinessHome-2.2.0.dmg y .zip
```

Luego copiar a `releases/Mac/`:
- `SmartBusinessHome-2.2.0.dmg`
- `SmartBusinessHome-2.2.0-mac.zip`

## Alternativa
La app también corre en macOS sin instalador:
- `npm start` → http://localhost:3000
- `npm run electron`
