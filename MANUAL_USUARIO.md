# Manual de Usuario — SmartBusinessHome

## 1. Introducción

SmartBusinessHome es una aplicación de escritorio que se ejecuta en el navegador. Al iniciar (`npm start`) abre `http://localhost:3000` con 8 secciones accesibles desde la barra superior o las pestañas.

## 2. Selector de Periodo

En la parte superior de la pantalla hay un control **Periodo (YYYY-MM)**. Cambia el mes y pulsa **Actualizar** para filtrar todos los datos (ingresos, gastos, balance, alertas).

## 3. Balance (📊)

Muestra tres indicadores:

- **Total Ingresos** (verde)
- **Total Gastos** (rojo)
- **Saldo** con etiqueta Superávit (✅) o Déficit (⚠️)

Debajo: resumen del periodo y tabla de **transacciones recientes** (últimas 8).

## 4. Ingresos (💰)

1. Completa el formulario: **Monto**, **Fecha**, **Categoría** (Salario, Bono, Extra…), **Fuente**, **Descripción**.
2. Pulsa **Guardar ingreso**.
3. La tabla inferior lista los ingresos del periodo. Usa el buscador y el filtro por categoría.
4. **Editar**: pulsa Editar en la fila, modifica y guarda. **Eliminar**: pulsa Eliminar y confirma.

## 5. Gastos (💸)

Idéntico a Ingresos pero con categorías de gasto (Alimentación, Servicios, Transporte, Salud, Educación, Entretenimiento, Vivienda, Otros). Al registrar un gasto el sistema verifica el presupuesto y genera alertas si aplica.

## 6. Presupuesto (📋)

1. Define el **Presupuesto total mensual** y selecciona el **Periodo**.
2. Asigna montos por categoría (deja en blanco las que no apliquen).
3. Pulsa **Guardar presupuesto**. Si la suma por categorías excede el total, el sistema avisa.
4. El panel **Presupuesto actual** muestra lo guardado para el periodo.

## 7. Categorías (📈)

- **Gráficos**: torta de distribución de gastos y barras por categoría (Canvas nativo).
- **Detalle por categoría**: tabla con gastado, presupuestado, % del total, % de ejecución, estado (Normal / Advertencia / Excedido) y barra de progreso.
- **Categorías personalizadas**: formulario Nombre + Tipo (Gasto/Ingreso) y botón Crear. Las personalizadas aparecen en la tabla con opción Eliminar (las predefinidas no se pueden eliminar).

## 8. Histórico (🗓)

- Ingresa **Periodo** y opcionalmente **Comparar con** otro mes.
- Pulsa **Consultar** para ver totales y diferencia de saldo.
- Debajo, la sección **Tendencias** lista todos los periodos con ingresos, gastos y saldo.

## 9. Alertas (🔔)

Lista alertas del periodo actual:

- **Advertencia** (amarillo) al 80% del presupuesto de una categoría.
- **Excedido** (rojo) al superar el 100%.

Si no hay alertas se muestra “Sin alertas — presupuesto bajo control”.

## 10. Configuración (⚙️)

- **Exportar CSV**: botones para descargar ingresos, gastos y presupuestos.
- **Crear respaldo**: genera un archivo en `data/backups/backup-<timestamp>.json`.
- **Acerca de** y **Ayuda** con información de versión y guía rápida.

## 11. Preguntas Frecuentes

| Pregunta | Respuesta |
|----------|-----------|
| ¿Dónde se guardan mis datos? | En `data/database/financiero.json` en tu equipo. |
| ¿Puedo transferir datos a otro equipo? | Copia `financiero.json` o usa Exportar CSV / Respaldo. |
| ¿Qué pasa si cierro sin guardar? | Todo se guarda automáticamente al crear/editar/eliminar. |
| ¿Cómo restauro un respaldo? | Reemplaza `financiero.json` por el archivo de `data/backups/`. |

## 12. Soporte

Reporta incidencias al autor incluyendo periodo, pasos y mensaje de error visible.
