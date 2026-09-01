# Manual de Usuario — SmartBusinessHome v2.0

> Versión 2.0 — 2026-09-01 — Autor: José Arnulfo Céspedes Albornoz

## 1. Acceso y Autenticación

Al abrir `http://localhost:3000` se redirige a `/login` si no hay sesión.

- **Admin por defecto:** usuario `admin` / clave `Admin123!`
- **Crear cuenta:** en la tarjeta de login pulsa “Crear cuenta”, ingresa usuario, nombre mostrado y clave (mínimo 6 caracteres, al menos 1 mayúscula y 1 número). La cuenta se crea como rol `user`.
- **Sesión:** al iniciar sesión se guarda un token JWT (12 h) en `localStorage`. Todas las peticiones incluyen `Authorization: Bearer <token>`.
- **Cambiar clave:** en pestaña Config → Cambiar clave (ingresa clave actual y nueva).
- **Cerrar sesión:** botón Salir en el header.

Seguridad: claves con `bcryptjs` (10 rounds), rate limit en login (10 intentos/15 min), validación de fortaleza.

## 2. Navegación

Header + pestañas: Balance, Ingresos, Gastos, Presupuesto, Categorías, Histórico, **Análisis**, Alertas, Config y **Admin** (solo visible si tu rol es `admin`).

Selector global **Periodo (YYYY-MM)** arriba: filtra Balance, Ingresos, Gastos, Categorías y Alertas. El módulo Análisis usa su propio rango Desde/Hasta.

## 3. Balance

Tres KPIs animados: Ingresos, Gastos, Saldo (verde superávit / rojo déficit), resumen y tabla de transacciones recientes (8 últimas).

## 4. Ingresos y Gastos

Formulario: Monto, Fecha, Categoría, Fuente/Descripción. Guardado aislado por usuario (no ves datos de otros usuarios). Listado con buscador por texto y filtro por categoría. Acciones Editar/Eliminar por fila.

## 5. Presupuesto

Define presupuesto total y periodo, asigna montos por categoría de gasto. Validación: suma por categorías ≤ total. Panel “Presupuesto actual” muestra lo guardado.

## 6. Categorías (del periodo)

Gráficos de torta (distribución) y barras (comparativo) en Canvas, tabla detalle con estado Normal/Advertencia (80 %)/Excedido (100 %), barra de progreso. Gestión de categorías personalizadas (crear/eliminar; las predefinidas no se eliminan).

## 7. Histórico

Consulta un periodo y compáralo con otro. Debajo, tabla de tendencias (todos los periodos con ingresos, gastos, saldo).

## 8. Análisis — Nuevo

Pestaña **Análisis** junto a Histórico.

- **Filtros:** Desde (mes), Hasta (mes), Categoría (todas o específica), Vista (Todo / Solo ingresos / Solo gastos), botón Aplicar y Limpiar.
- **Herramientas de manipulación:** slider Zoom (0.7–1.6× escala de gráficos), checkbox Animación, segmentación por categoría y por rango de fechas.
- **KPIs del rango:** ingresos, gastos y saldo del rango seleccionado.
- **Sección Ingresos:** barras por categoría, torta de distribución y línea mensual de ingresos.
- **Sección Gastos:** barras, torta y línea mensual de gastos (separados, como pidió el cliente).
- **Comparativo mensual:** línea Ingresos vs Gastos y barras comparativas.

Todos los gráficos usan Canvas nativo y se regeneran al cambiar filtros.

## 9. Alertas

Lista del periodo actual: advertencia amarilla al 80 % y excedido rojo al 100 % por categoría.

## 10. Configuración

- Exportar CSV (ingresos, gastos, presupuestos) — descarga filtrada por tu usuario.
- Crear respaldo (genera `data/backups/backup-*.json` + copia `.db`).
- Cambiar clave.
- Personalización local: tema Claro/Oscuro y color primario (se aplica al instante y se guarda en `localStorage`; el admin puede guardar global en app_config).

## 11. Administración (solo admin)

Pestaña **Admin** y entrada en el header.

- **Usuarios:** tabla con crear (usuario, nombre, clave, rol user/admin), reset de clave y eliminar (no puedes eliminarte a ti mismo).
- **Backups:** listar y crear backup global.
- **Personalización global:** tema, color primario y color de fondo (persisten en tabla `app_config` y se aplican a todos los usuarios al cargar).

## 12. Animaciones

Títulos con `fadeSlideDown`, secciones con `fadeInUp`, KPIs con elevación al hover, botones con escala al pulsar, tabs con transición y alertas con fade.

## 13. FAQ

| Pregunta | Respuesta |
|---|---|
| ¿Dónde están mis datos? | En `data/database/financiero.db` (SQLite). Antes `financiero.json` se migra automáticamente. |
| ¿Comparto datos con otros usuarios? | No, cada usuario ve solo sus ingresos/gastos/presupuestos. El admin gestiona cuentas. |
| ¿Olvidé mi clave? | Pide al admin que haga Reset desde Admin → Usuarios. |
| ¿Cómo restauro un backup? | Admin → Backups (ver archivos). Por seguridad la restauración es manual: copia el `.db` deseado a `data/database/financiero.db` y reinicia. |

