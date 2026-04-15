# Figma Mockup Prompt — Sprint 2: Evaluación y Análisis
## Productivity App · Personal Habit Tracker

---

## Prerequisito visual

El Design System de S1 ya existe (colores, tipografía, componentes base). Este sprint extiende ese sistema — no redefine nada. Reutiliza los componentes de S1 y agrega los nuevos descritos aquí.

---

## Nuevas Pantallas a Diseñar (Sprint 2)

### Pantalla 4 — Registro de métricas diarias

**Acceso:** Botón o sección en el dashboard principal, visible junto a las tareas del día.

**Layout:** Card centrada, ancho máximo 520px, dentro del área de contenido principal.

**Contenido:**

Header: "Métricas de hoy" + fecha actual

Tres campos de entrada con slider + valor numérico:

**Sueño:**
- Label: "Horas de sueño"
- Slider: 0 a 12, step 0.5
- Valor mostrado: "7.5 h"
- Indicador de puntos en tiempo real:
  - >= 7h → badge verde "+10 pts"
  - 5–6.9h → badge gris "0 pts"
  - < 5h → badge rojo "−10 pts"

**Uso del celular:**
- Label: "Uso del celular"
- Slider: 0 a 300, step 5
- Valor mostrado: "45 min"
- Indicadores:
  - <= 60 min → "+10 pts"
  - 61–120 min → "0 pts"
  - > 120 min → "−10 pts"

**Tiempo de estudio:**
- Label: "Tiempo de estudio"
- Slider: 0 a 240, step 10
- Valor mostrado: "90 min"
- Indicadores:
  - >= 60 min → "+10 pts"
  - 30–59 min → "+5 pts"
  - < 30 min → "0 pts"

Footer del card:
- Impacto total de métricas: "+20 pts de métricas"
- Botón primario: "Guardar métricas"

---

### Pantalla 5 — Vista semanal

**Acceso:** Ítem "Semana" en la sidebar de navegación.

**Layout:** Misma estructura que el dashboard (sidebar + área principal).

**Área principal:**

**Sección superior — resumen semanal (4 metric cards en fila):**
- "Total semanal" → número grande (ej: 185)
- "Promedio diario" → número (ej: 26)
- "Mejor día" → día de la semana (ej: "Martes")
- "Peor día" → día de la semana (ej: "Jueves")

**Sección central — gráfico de tendencia (últimos 7 días):**
- Gráfico de barras vertical
- Eje X: días de la semana (Lun–Dom) con fecha corta debajo (ej: "13 ene")
- Eje Y: puntos (puede ser implícito, solo mostrar valores encima de cada barra)
- Barras:
  - Color `--accent` (#1D9E75) para scores positivos
  - Color `--penalty` (#E24B4A) para scores negativos o cero
  - Barra del día actual destacada con borde o tono más saturado
- Valor encima de cada barra: número entero con signo ("+35", "−5")
- Altura mínima de barra: 4px (para días con score 0)

Datos de ejemplo para el mockup:
```
Lun 13: +15
Mar 14: +35  ← mejor día
Mié 15: +20
Jue 16: -5   ← peor día
Vie 17: +30
Sáb 18: +25
Dom 19: +65  ← hoy (destacado)
```

**Sección inferior — breakdown semanal por día:**
- Lista colapsable: cada día muestra su score y al expandir muestra el breakdown de tareas
- Estado colapsado: "Martes 14 · +35 pts → 4 tareas · 3 completadas"
- Estado expandido: lista de tareas con sus puntos individuales

---

### Pantalla 6 — Hábitos detectados

**Acceso:** Sección en la vista semanal, o tab separado. Mostrar ambas opciones en el mockup y dejar una anotación indicando cuál se prefiere.

**Layout:** Grid de cards, 2 columnas.

**Tres secciones con header y color de fondo diferenciado:**

**Hábitos positivos** (header con `--accent-light`):
- Completados >= 5 de 7 días la última semana
- Cada card muestra:
  - Nombre de la tarea
  - "X de 7 días esta semana"
  - Badge verde "Hábito positivo"
  - Barra de consistencia: 7 círculos pequeños (lleno = completado, vacío = no completado)

**Hábitos a mejorar** (header con `--penalty-light`):
- Tareas BASE completadas <= 1 de 7 días
- Misma estructura de card pero badge rojo "Requiere atención"

**Neutrales** (header con `--bg-secondary`):
- El resto. Solo listar con nombre + frecuencia, sin barra de consistencia para no saturar.

**Datos de ejemplo:**
```
Positivos:
  Ejercicio 30 min — 6/7 días
  Leer 20 páginas — 5/7 días

A mejorar:
  Meditación — 1/7 días

Neutrales:
  Llamar al médico — 2/7 días
  Revisar correos — 3/7 días
```

---

## Nuevos Componentes

### Slider con indicador de puntos

```
[Label]                          [valor] [badge pts]
[━━━━━━━━●━━━━━━━━━━━━━━━━]
```

- Track height: 4px, color `--bg-tertiary`
- Track llenado (hasta el thumb): color `--accent`
- Thumb: 16px círculo, `--accent`, sin sombra
- Badge de puntos: mismo sistema de badges de S1

### Barra de consistencia (7 círculos)

```
● ● ● ○ ● ● ●   — 6 de 7 días
```

- Círculo lleno: 10px, fill `--accent`
- Círculo vacío: 10px, border `--border`, fill transparent
- Gap: 6px entre círculos

### Metric card (resumen semanal)

```
┌─────────────────────┐
│  Total semanal      │
│  185                │
└─────────────────────┘
```

- Background: `--bg-secondary`
- Label: 13px, `--text-secondary`
- Número: 32px, weight 600, `--text-primary`
- Sin borde, border-radius 8px, padding 16px

### Barra del gráfico

- Ancho fijo: 40px por barra
- Gap entre barras: 16px
- Score positivo: fill `--accent`
- Score negativo: fill `--penalty`
- Día actual: fill con opacidad 100% vs resto al 70%
- Valor encima: 13px, weight 500

---

## Estados a Documentar

| Componente | Estados |
|------------|---------|
| Slider | Default · Active (arrastrando) · Con métrica guardada |
| Card de hábito | Positivo · Negativo · Neutral |
| Barra del gráfico | Normal · Día actual · Hover (tooltip con breakdown) |
| Día colapsado | Collapsed · Expanded |

---

## Organización en Figma

Agregar a la página existente `02 — Pantallas S1` una nueva página:

```
Pages:
  01 — Design System     (agregar nuevos componentes de S2)
  02 — Pantallas S1      (sin cambios)
  03 — Pantallas S2      ← nueva
      [Frame] Registro de métricas
      [Frame] Vista semanal
      [Frame] Hábitos detectados / opción A (en vista semanal)
      [Frame] Hábitos detectados / opción B (tab separado)
  04 — Prototipo S2      ← nuevo
      Flujo: Dashboard → click "Semana" → Vista semanal → scroll a hábitos
      Flujo: Dashboard → click "Métricas" → Registro → Guardar → Dashboard actualizado
```

---

