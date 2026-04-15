# Growth App - Guia UI Completa

> Especificacion precisa para recrear la interfaz. Escrita como referencia tecnica para UI Engineers.

---

## 1. Tipografia

| Propiedad | Valor |
|-----------|-------|
| Familia | `Inter` (Google Fonts: 400, 500, 600, 700) |
| Fallback | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| Base (html) | `16px` |
| Import | `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')` |

### Escala tipografica en uso

| Elemento | Tamano | Peso | Line-height | Uso |
|----------|--------|------|-------------|-----|
| Score grande | `64px` | 700 (bold) | `1` (leading-none) | ScoreCard numero principal |
| Score sidebar | `text-5xl` (48px) | 700 | `1` | Puntuacion en sidebar |
| Timer display | `text-5xl` (48px) | 900 (black) | `1` | Reloj Pomodoro, `tabular-nums` |
| Level up titulo | `text-3xl` (30px) | 900 (black) | - | Notificacion level up |
| Streak numero | `text-3xl` (30px) | 700 | - | StreakBadge |
| Headings h2 | `text-2xl` (24px) | 700 | - | Titulos de seccion, modal |
| Headings h3 | `text-xl` (20px) | 700 | - | Titulos de cards |
| App name | `text-xl` (20px) | 700 | - | "Growth" en sidebar |
| Score mid | `text-2xl` (24px) | 700 | - | QuickStats valores |
| Body / Labels | `text-base` (16px) | 700/500 | - | Nombres de tareas, labels |
| Nav items | `text-sm` (14px) | 600 | - | Botones nav sidebar |
| Task name | `text-sm` (14px) | 500 | - | Texto de cada tarea |
| Descriptivo | `text-sm` (14px) | 500 | - | Descripciones secundarias |
| Micro labels | `text-xs` (12px) | 600-700 | - | Labels uppercase, badges, metadata |
| Badge points | `text-xs` (12px) | 600 | - | "+10 pts", "-5 pts" |
| Chart ticks | `13px` | 500 | - | Ejes del grafico Recharts |

### Patrones tipograficos

- **Labels uppercase**: `text-xs font-semibold uppercase tracking-wide` — para micro-labels como "Energia hoy", "Racha activa", "Adicionales"
- **Numeros tabulares**: clase `tabular-nums` solo en el timer Pomodoro
- **Line-through**: `line-through opacity-50 text-[#95A5A6]` para tareas completadas

---

## 2. Paleta de colores

### Colores core (CSS custom properties en `:root`)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-primary` | `#FFFFFF` | Fondo principal, cards |
| `--bg-secondary` | `#F8F9FA` | Sidebar, inputs, fondos sutiles |
| `--bg-tertiary` | `#E9ECEF` | Bordes, progress bars vacias, separadores |
| `--bg-dark` | `#2C3E50` | Card de nivel, textos principales dark |
| `--text-primary` | `#1A1A1A` | Texto base (heredado de body) |
| `--text-secondary` | `#6C757D` | Texto secundario, descripciones |
| `--text-tertiary` | `#ADB5BD` | Placeholders, texto deshabilitado |
| `--accent` | `#2ECC71` | Color principal verde |
| `--accent-dark` | `#27AE60` | Gradiente secundario verde |
| `--accent-light` | `#D4EDDA` | Background de badges positivos, logros desbloqueados |
| `--nature-green` | `#52C41A` | Copa del arbol, gradiente final en progress bars |
| `--forest-dark` | `#1B4332` | (reservado, no usado actualmente) |
| `--warm-accent` | `#95A5A6` | Penalizacion, estados negativos/neutros |
| `--penalty-light` | `#F1F3F5` | Background de badges negativos |

### Uso semantico directo (hardcoded, no tokens)

| Color | Hex | Contexto |
|-------|-----|----------|
| Texto headings | `#2C3E50` | Todos los h2, h3, nombres de tareas activas |
| Texto muted | `#6C757D` | Descripciones, labels secundarios |
| Texto placeholder | `#ADB5BD` | Inputs, badges neutrales |
| Texto ultra-muted | `#95A5A6` | Labels micro, subtitulos, penalizaciones |
| Tronco arbol SVG | `#6D4C41` | Stroke del tronco en TreeGrowth |
| Tooltip bg | `#2C3E50` | Fondo tooltip Recharts |
| Dark card bg | `#34495E` | Gradiente secundario en LevelProgress |

### Gradientes recurrentes

| Nombre | Valor | Uso |
|--------|-------|-----|
| Green primary | `from-[#2ECC71] to-[#27AE60]` | Botones CTA, nav activo, meta cumplida, level up toast |
| Green progress | `from-[#2ECC71] to-[#52C41A]` | Barras de progreso, XP bar |
| Dark card | `from-[#2C3E50] to-[#34495E]` | LevelProgress card |
| Subtle bg | `from-[#F8F9FA] to-[#E9ECEF]` | Score section en sidebar, mobile header |
| Logo icon | `from-[#2ECC71] to-[#27AE60]` | Icono app 🌱 |

---

## 3. Espaciado y layout

### Grid principal

```
Desktop (lg: 1024px+):
┌─────────────┬──────────────────────────────┐
│  Sidebar     │  Main Content               │
│  w-[280px]   │  flex-1                     │
│  fixed-left  │  max-w-[1400px] mx-auto     │
│              │  p-8                        │
└─────────────┴──────────────────────────────┘

Mobile (<1024px):
┌──────────────────────────────┐
│  MobileHeader (sticky)       │
├──────────────────────────────┤
│  Nav tabs (horizontal scroll)│
├──────────────────────────────┤
│  Main Content                │
│  p-4                        │
└──────────────────────────────┘
```

### DailyView layout interno

```
Desktop:
┌────────────────────────┬──────────────┐
│  QuickStats (3 cols)   │  DailyGoal   │
│  Task list cards       │  ScoreCard   │
│  flex-1                │  Breakdown   │
│                        │  w-[340px]   │
└────────────────────────┴──────────────┘

Mobile: columna unica, gap-6
```

### Espaciado consistente

| Contexto | Valor |
|----------|-------|
| Padding cards | `p-6` (desktop), `p-4` (mobile) |
| Gap entre cards | `gap-6` (seccion), `gap-3` (interno) |
| Padding sidebar | `p-6` (desktop), `p-4` (mobile) |
| Padding main | `p-8` (desktop), `p-4` (mobile) |
| Padding modal | `p-6` |
| Margin entre secciones | `mb-6` |
| Gap nav items | `space-y-2` |
| Padding botones CTA | `py-4 px-6` |
| Padding botones nav | `px-4 py-3` |
| Padding botones pequenos | `py-2.5 px-4-5` |
| Task item padding | `py-2.5`, `-mx-6 px-6` (full-bleed hover) |
| Task item min-height | `52px` |

---

## 4. Bordes y radios

| Elemento | Border | Radius |
|----------|--------|--------|
| Cards principales | `border-2 border-[#E9ECEF]` | `rounded-2xl` (16px) |
| Sidebar | `border-r-2 border-[#E9ECEF]` | — |
| Modal container | `border-2 border-[#E9ECEF]` | `rounded-3xl` (24px) |
| Botones CTA | ninguno | `rounded-xl` (12px) |
| Botones nav | ninguno | `rounded-xl` |
| Icono app | ninguno | `rounded-xl` |
| Badges (TaskBadge) | `border border-[color]/20` | `rounded-full` |
| Progress bars | ninguno | `rounded-full` |
| Checkbox | `border-2` | `rounded-full` |
| Inputs | `border-2 border-[#E9ECEF]` | `rounded-xl` |
| Radio option cards | `border-2` | `rounded-xl` |
| Streak badge | `border-2 border-[#2ECC71]` | `rounded-2xl` |
| QuickStats cards | `border-2` | `rounded-2xl` |
| Tooltip chart | ninguno | `12px` |
| Dev controls | `border-2 border-[#E9ECEF]` | `rounded-2xl` |

**Patron**: `border-2` es el default para separadores visibles. `border` (1px) solo para badges internos.

---

## 5. Sombras

| Nivel | Clase | Uso |
|-------|-------|-----|
| Sutil | `shadow-sm` | Cards, badges, iconos, nav activo en reposo |
| Media | `shadow-md` | Nav activo con gradiente |
| Fuerte | `shadow-lg` | Score section sidebar, hover en botones, dev controls |
| Epica | `shadow-2xl` | Modal, level up toast |

**Patron hover**: botones CTA usan `hover:shadow-lg` + `hover:scale-[1.02]`.

---

## 6. Componentes UI - Anatomia

### 6.1 Checkbox (TaskItem)

```
Dimensiones: w-[20px] h-[20px]
Forma: rounded-full
Unchecked: border-2 border-[#E9ECEF] bg-white
Hover: border-[#2ECC71]/50
Checked: bg-[#2ECC71] border-[#2ECC71] shadow-sm
Check SVG: 12x12, stroke white, strokeWidth 2, animated pathLength
```

### 6.2 TaskBadge

```
Layout: inline-flex px-2.5 py-1 rounded-full
Positivo: bg-[#D4EDDA] text-[#2ECC71] border-[#2ECC71]/20
Negativo: bg-[#F1F3F5] text-[#95A5A6] border-[#95A5A6]/20
Neutral:  bg-[#F8F9FA] text-[#ADB5BD] border-[#ADB5BD]/20
Formato: "{signo}{puntos} pts" (ej: "+10 pts", "−5 pts")
```

### 6.3 Progress Bar (patron reutilizado)

```
Container: h-2 a h-4 bg-[#E9ECEF] o bg-[#F8F9FA] rounded-full overflow-hidden
Fill: bg-gradient-to-r from-[#2ECC71] to-[#52C41A] rounded-full
Animacion: Motion width transition 500ms ease-out
Variante dark (LevelProgress): container bg-white/10, fill from-[#2ECC71] to-[#52C41A]
```

### 6.4 Boton CTA primario

```
Background: bg-gradient-to-r from-[#2ECC71] to-[#27AE60]
Texto: text-white font-bold (o font-semibold)
Padding: py-4 px-6 (grande) | py-2.5 px-4-5 (mediano)
Radius: rounded-xl
Hover: hover:shadow-lg hover:scale-[1.02]
Transicion: transition-all
```

### 6.5 Boton secundario / ghost

```
Background: bg-[#F8F9FA] border-2 border-[#E9ECEF]
Texto: text-[#6C757D] font-semibold
Hover: hover:bg-white hover:border-[#2ECC71] hover:text-[#2ECC71]
Radius: rounded-xl
```

### 6.6 Nav item (Sidebar)

```
Layout: flex items-center gap-3 px-4 py-3 rounded-xl
Activo: text-white bg-gradient-to-r from-[#2ECC71] to-[#27AE60] shadow-md
Inactivo: text-[#6C757D] hover:bg-white hover:shadow-sm
Icono: Lucide 18px
Texto: text-sm font-semibold
```

### 6.7 Card estandar

```
Container: bg-white border-2 border-[#E9ECEF] rounded-2xl p-6 shadow-sm
Titulo: text-lg font-bold text-[#2C3E50] mb-6
```

### 6.8 Modal

```
Overlay: fixed inset-0 bg-black/50 backdrop-blur-sm
Container: bg-white rounded-3xl max-w-[500px] mx-4 shadow-2xl border-2 border-[#E9ECEF]
Header: p-6 border-b-2 border-[#E9ECEF], flex justify-between
Body: p-6 space-y-6
Close btn: text-[#95A5A6] hover:text-[#2C3E50] p-2 hover:bg-[#F8F9FA] rounded-xl
```

### 6.9 Input

```
Padding: px-5 py-3.5
Background: bg-[#F8F9FA]
Border: border-2 border-[#E9ECEF] rounded-xl
Texto: text-base text-[#2C3E50] font-medium
Placeholder: placeholder:text-[#ADB5BD]
Focus: focus:ring-2 focus:ring-[#2ECC71] focus:border-[#2ECC71]
Error: ring-2 ring-[#95A5A6] border-[#95A5A6]
```

### 6.10 Pomodoro Timer

```
SVG circular: w-56 h-56 (224px), circle r=100, strokeWidth=12
Colores: track #F8F9FA, work #2ECC71, break #6C757D
Pill interna: bg-[#F8F9FA] px-4 py-2 rounded-full
Dots completados: w-3 h-3 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60]
```

---

## 7. Arbol animado (TreeGrowth)

Cuatro etapas segun `progress` (0-100):

| Etapa | Rango | Elementos |
|-------|-------|-----------|
| `seed` | 0-24% | Circulo 6x6 verde gradiente |
| `sprout` | 25-49% | Tallo h=40px w=1 + 2 circulos 3x3 |
| `sapling` | 50-74% | SVG 80x100: tronco `#6D4C41` strokeWidth=4, copa 3 circulos (r=25, r=18, r=18) |
| `tree` | 75-100% | SVG 120x140: tronco strokeWidth=6, ramas strokeWidth=3, copa 3 circulos (r=35, r=28, r=28) + 3 particulas flotantes animadas |

Colores copa: `#52C41A` (opacity 0.8-0.9) y `#2ECC71` (opacity 0.7-0.8).

Container: `w-full h-48 flex items-end justify-center`.

Ground: `h-3 bg-gradient-to-t from-[#2C3E50] to-transparent rounded-full opacity-20`.

---

## 8. Animaciones (Motion / Framer Motion)

| Patron | Props | Uso |
|--------|-------|-----|
| Fade-in slide | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` | Cards, vistas, toasts |
| Scale bounce | `initial={{ scale: 0 }} animate={{ scale: 1 }}` | Checkmarks, badges, arbol |
| Spring scale | `type: 'spring', stiffness: 200` | Score number, goal complete icon |
| Slide X | `initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}` | Task items, achievement items |
| Hover lift | `whileHover={{ scale: 1.05, y: -2 }}` | QuickStats cards |
| Tap feedback | `whileTap={{ scale: 0.9 }}` | Checkbox |
| Wiggle | `animate={{ rotate: [0, -10, 10, -10, 0] }}` repeat | Icono hoja en StreakBadge |
| Path draw | `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}` | Checkmark SVG, ramas arbol |
| Floating particles | `y: [-20, -60], opacity: [0.7, 0]` repeat 3s | Solo en stage `tree` |
| View transition | `duration: 0.3` con `AnimatePresence` | Cambio entre tabs |
| Progress bar | `width` animado, `duration: 0.5, ease: 'easeOut'` | Todas las barras de progreso |
| Stagger children | `delay: index * 0.1` | Achievement list, QuickStats |

### Confetti (canvas-confetti)

| Tipo | Particulas | Spread | Colores |
|------|-----------|--------|---------|
| Task complete | 30 | 40 | `['#2ECC71', '#52C41A', '#27AE60']` |
| Goal complete | 100 | 70 | `['#2ECC71', '#D4EDDA', '#27AE60', '#52C41A']` |
| Level up | 3/burst bilateral | 55 | `['#2ECC71', '#52C41A', '#27AE60']` cada 50ms por 2s |

---

## 9. Iconografia

**Libreria**: Lucide React. Tamanos estandar:

| Contexto | Size |
|----------|------|
| Nav icons | 18 |
| Card headers | 20 |
| Streak badge | 28 |
| Achievement icons | 24 |
| Botones inline | 18-20 |
| Labels micro | 14 |
| Modal close | 22 |

**Iconos usados**: `Calendar`, `TrendingUp`, `Timer`, `Plus`, `X`, `Play`, `Pause`, `RotateCcw`, `Coffee`, `Brain`, `Sprout`, `Leaf`, `Trophy`, `Target`, `Zap`, `Award`, `CheckCircle`, `CheckCircle2`.

**Emojis naturales**: 🌱 (app icon, semilla, CTA), 🌳 (level up).

---

## 10. Responsive Breakpoints

| Breakpoint | Comportamiento |
|------------|---------------|
| `< lg` (< 1024px) | Layout vertical. MobileHeader visible. Sidebar nav = horizontal scroll. TreeGrowth, LevelProgress, StreakBadge, score ocultos en sidebar (movidos a MobileHeader). Padding `p-4`. |
| `>= lg` (1024px+) | Layout horizontal. Sidebar 280px fija izquierda. MobileHeader oculto. Padding `p-8`. DailyView 2 columnas. |

Clases clave: `hidden lg:block`, `lg:hidden`, `flex-col lg:flex-row`, `p-4 lg:p-6`, `p-4 lg:p-8`.

---

## 11. Niveles y gamificacion (referencia visual)

| Nivel | Nombre | Rango |
|-------|--------|-------|
| 1-4 | Semilla | < nivel 5 |
| 5-9 | Brote | < nivel 10 |
| 10-19 | Arbol joven | < nivel 20 |
| 20-29 | Arbol fuerte | < nivel 30 |
| 30+ | Bosque | >= nivel 30 |

Nombre se muestra en pill: `bg-white/10 px-2 py-1 rounded-full` dentro de LevelProgress card.

---

## 12. Estados especiales

### Empty State
Centro de pantalla, `min-h-[calc(100vh-4rem)]`. TreeGrowth en progress=0 (seed). Titulo + descripcion + boton CTA.

### Meta cumplida (DailyGoal)
Card cambia de `bg-white border-[#E9ECEF]` a `bg-gradient-to-r from-[#2ECC71] to-[#27AE60] border-[#2ECC71]`. Texto blanco. Progress bar fill = `bg-white`. Mensaje con emoji 🌱.

### Level Up Toast
`fixed top-8 left-1/2 -translate-x-1/2 z-50`. Gradiente verde. `border-4 border-white/20 rounded-3xl shadow-2xl`. Con `AnimatePresence`.

### XP Gain Toast
Componente separado, se muestra brevemente al ganar XP.

---

## 13. Z-index layers

| Capa | Z-index | Elemento |
|------|---------|----------|
| Base | 0 | Contenido principal |
| Dev controls | 40 | `fixed bottom-6 right-6` |
| Modal overlay | 50 | AddTaskModal |
| Level up toast | 50 | `fixed top-8` |

---

## 14. Dependencias UI

| Paquete | Uso |
|---------|-----|
| `motion` | Todas las animaciones (import from `motion/react`) |
| `recharts` | Grafico de barras semanal |
| `canvas-confetti` | Celebraciones |
| `lucide-react` | Iconografia |

---

## 15. Estructura de archivos (componentes UI)

```
src/
├── styles/
│   ├── fonts.css          # Import Inter
│   ├── theme.css          # CSS custom properties, base styles
│   ├── tailwind.css        # Tailwind directives
│   └── index.css          # Barrel import
├── app/
│   ├── App.tsx            # Root: layout + state orchestration
│   ├── views/
│   │   ├── DailyView.tsx  # Vista diaria con tareas
│   │   ├── WeeklyView.tsx # Vista semanal con graficas
│   │   └── FocusView.tsx  # Timer Pomodoro
│   ├── components/
│   │   ├── Sidebar.tsx        # Nav + tree + level + streak
│   │   ├── MobileHeader.tsx   # Header condensado mobile
│   │   ├── EmptyState.tsx     # Estado sin tareas
│   │   ├── TaskItem.tsx       # Fila de tarea individual
│   │   ├── TaskBadge.tsx      # Badge de puntos
│   │   ├── AddTaskModal.tsx   # Modal nueva tarea
│   │   ├── TreeGrowth.tsx     # Arbol animado SVG
│   │   ├── LevelProgress.tsx  # Card de nivel dark
│   │   ├── StreakBadge.tsx     # Badge de racha
│   │   ├── ScoreCard.tsx      # Puntuacion grande
│   │   ├── QuickStats.tsx     # 3 mini-stats
│   │   ├── DailyGoal.tsx      # Meta diaria con progreso
│   │   ├── BreakdownCard.tsx  # Desglose de puntos
│   │   ├── WeeklyChart.tsx    # Grafico Recharts
│   │   ├── AchievementCard.tsx # Lista de logros
│   │   ├── PomodoroTimer.tsx  # Timer circular
│   │   ├── ConfettiCelebration.tsx
│   │   ├── TaskCompletionCelebration.tsx
│   │   ├── XPGainToast.tsx
│   │   ├── AchievementToast.tsx
│   │   └── StatsCard.tsx
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   ├── useGamification.ts
│   │   ├── useAchievements.ts
│   │   └── useDate.ts
│   └── constants/
│       └── data.ts
```

---

## 16. Principios de diseno

1. **Bordes sobre sombras**: la jerarquia visual se logra con `border-2 border-[#E9ECEF]`, no con sombras agresivas. Las sombras son complementarias (`shadow-sm`).
2. **Gradientes selectivos**: solo en CTAs, nav activo, progress fills y el card de nivel dark. El resto es color plano.
3. **Verde como unico color de acento**: toda la paleta cromatica gira en torno a `#2ECC71` / `#27AE60` / `#52C41A`. No hay azul, rojo ni naranja.
4. **Penalizacion gris, no roja**: los estados negativos usan `#95A5A6` (gris calido), nunca rojo. Reduce ansiedad.
5. **Microinteracciones con proposito**: cada animacion comunica algo (tarea completada = check path draw, XP ganado = toast, nivel subido = confetti).
6. **Full-bleed hover en tasks**: `-mx-6 px-6` para que el hover de cada tarea se extienda hasta los bordes del card.
7. **Mobile-first responsive**: todo el layout funciona con `flex-col` por defecto y se reorganiza con `lg:`.
