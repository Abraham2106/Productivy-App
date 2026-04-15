# Productivity App — Sprint Progress

## Decisiones Arquitectónicas (ADR)

| ID | Decisión | Justificación |
|----|----------|---------------|
| ADR-01 | Patrón Strategy para scoring | `TaskService` desacoplado de implementaciones concretas. Swap V1→V3 sin modificar servicios. |
| ADR-02 | `ITaskRepository` como frontera de infraestructura | Supabase queda en capa de infraestructura. Migración de proveedor = reescribir solo el adaptador. |
| ADR-03 | `task_type: enum(BASE, ADDITIONAL)` desde V1 | Scoring requiere tipología desde el inicio. Extensible sin migración en V2. |
| ADR-04 | `SCORE_DETAIL` como tabla de relación | Desacopla el historial de puntuación de las tareas. Cambios de fórmula no requieren migrar `TASK`. |
| ADR-05 | Monolito Modular (no microservicios) | 1–10 usuarios, equipo individual. Complejidad operativa de microservicios no justificada en ninguna versión. |

---

## BACKLOG MAESTRO

| ID | Categoría | Descripción | Prioridad | Estado | Estimación | Sprint |
|----|-----------|-------------|-----------|--------|------------|--------|
| T-001 | [Chore] | Setup del proyecto: FastAPI + estructura de directorios | P0 | Pendiente | S | S1 |
| T-002 | [Chore] | Configurar Supabase: proyecto, credenciales, variables de entorno | P0 | Pendiente | S | S1 |
| T-003 | [Feature] | Entidad `Task` con `TaskType(BASE, ADDITIONAL)` | P0 | Pendiente | S | S1 |
| T-004 | [Feature] | Interfaz `ITaskRepository` + implementación `SupabaseTaskRepository` | P0 | Pendiente | M | S1 |
| T-005 | [Feature] | Interfaz `IScoringStrategy` + `RuleBasedStrategy` (V1) | P0 | Pendiente | M | S1 |
| T-006 | [Feature] | `TaskService`: crear, completar y listar tareas del día | P0 | Pendiente | M | S1 |
| T-007 | [Feature] | Endpoints REST: `POST /tasks`, `PATCH /tasks/{id}/complete`, `GET /tasks/today` | P0 | Pendiente | M | S1 |
| T-008 | [Feature] | Endpoint `GET /score/today` — score del día calculado | P1 | Pendiente | S | S1 |
| T-009 | [Feature] | Dashboard básico: lista de tareas del día + score numérico (UI mínima) | P1 | Pendiente | L | S1 |
| T-010 | [Chore] | Tests unitarios: `RuleBasedStrategy` y `TaskService` | P1 | Pendiente | M | S1 |
| T-011 | [Feature] | Registro de métricas diarias: sueño, uso de celular, tiempo de estudio | P1 | Pendiente | M | S2 |
| T-012 | [Feature] | Motor de reglas: clasificación y scoring de tareas adicionales | P1 | Pendiente | L | S2 |
| T-013 | [Feature] | Generación de score semanal + endpoint `GET /score/week` | P2 | Pendiente | M | S2 |
| T-014 | [Feature] | Visualización de tendencias: gráfico de score diario de los últimos 7 días | P2 | Pendiente | L | S2 |
| T-015 | [Feature] | Identificación de hábitos positivos/negativos por frecuencia | P2 | Pendiente | L | S2 |
| T-016 | [Chore] | Tests de integración: repositorio contra Supabase test instance | P2 | Pendiente | M | S2 |
| T-017 | [Feature] | Módulo Pomodoro: timer con conteo de sesiones | P3 | Pendiente | L | S3 |
| T-018 | [Feature] | `AIStrategy`: clasificación automática de tareas con LLM | P1 | Pendiente | XL | S3 |
| T-019 | [Feature] | Ajuste dinámico de puntuaciones basado en historial | P2 | Pendiente | XL | S3 |
| T-020 | [Feature] | Retroalimentación tipo "coach": resumen diario generado por IA | P2 | Pendiente | L | S3 |
| T-021 | [Feature] | Detección de patrones de comportamiento (análisis de `SCORE_DETAIL`) | P3 | Pendiente | XL | S3 |
| T-022 | [Chore] | Empaquetado como app instalable (desktop) | P2 | Pendiente | L | S4 |
| T-023 | [Feature] | Versión móvil: APK (React Native o PWA) | P2 | Pendiente | XL | S4 |
| T-024 | [Feature] | Sincronización multi-dispositivo vía Supabase Realtime | P2 | Pendiente | L | S4 |
| T-025 | [Chore] | CI/CD básico: tests automáticos en push | P3 | Pendiente | M | S4 |

---

## SPRINT 1 — MVP Funcional

**Objetivo:** Sistema usable end-to-end. El usuario puede registrar tareas del día, marcarlas como completadas y ver su puntaje diario.

**Fechas:** Iteración 1 (duración sugerida: 2 semanas)

**Valor entregado:** Responde a "¿completé mis tareas de hoy?" con un número.

### Burndown Checklist

- [ ] T-001 — Setup del proyecto: FastAPI + estructura de directorios
- [ ] T-002 — Configurar Supabase: proyecto, credenciales, variables de entorno
- [ ] T-003 — Entidad `Task` con `TaskType`
- [ ] T-004 — `ITaskRepository` + `SupabaseTaskRepository`
- [ ] T-005 — `IScoringStrategy` + `RuleBasedStrategy`
- [ ] T-006 — `TaskService`: crear, completar, listar
- [ ] T-007 — Endpoints REST CRUD de tareas
- [ ] T-008 — Endpoint `GET /score/today`
- [ ] T-009 — Dashboard básico (UI mínima funcional)
- [ ] T-010 — Tests unitarios: Strategy + Service

**Métricas:** 0 / 10 tareas completadas (0%)

**Bloqueos detectados:** Ninguno al inicio del sprint.

---

## SPRINT 2 — Evaluación y Análisis

**Objetivo:** El sistema pasa de registrar a analizar. El usuario obtiene visibilidad de tendencias y la calidad de su scoring mejora.

**Valor entregado:** Responde a "¿cómo fue mi semana en términos de hábitos?"

### Burndown Checklist

- [ ] T-011 — Registro de métricas diarias (sueño, celular, estudio)
- [ ] T-012 — Motor de reglas para tareas adicionales
- [ ] T-013 — Score semanal + endpoint
- [ ] T-014 — Gráfico de tendencia 7 días
- [ ] T-015 — Identificación de hábitos positivos/negativos
- [ ] T-016 — Tests de integración con Supabase

**Métricas:** 0 / 6 tareas completadas (0%) — inicia al completar S1.

**Prerequisito:** T-005 completado (estrategia de scoring extensible).

---

## SPRINT 3 — Inteligencia Adaptativa

**Objetivo:** El motor de evaluación evoluciona de reglas fijas a IA. El sistema personaliza el scoring según el historial del usuario.

**Valor entregado:** Responde a "¿qué tan diferente fue mi comportamiento esta semana vs. mi patrón habitual?"

### Burndown Checklist

- [ ] T-018 — `AIStrategy` con LLM (swap via `IScoringStrategy`)
- [ ] T-019 — Ajuste dinámico de puntuaciones
- [ ] T-020 — Retroalimentación tipo "coach"
- [ ] T-021 — Detección de patrones
- [ ] T-017 — Módulo Pomodoro

**Métricas:** 0 / 5 tareas completadas (0%) — inicia al completar S2.

**Prerequisito crítico:** ADR-01 implementado correctamente. Si `IScoringStrategy` no existe, T-018 requiere refactor masivo.

---

## SPRINT 4 — Despliegue y Portabilidad

**Objetivo:** El sistema está disponible en múltiples dispositivos sin fricción.

**Valor entregado:** Acceso desde cualquier dispositivo con datos sincronizados.

### Burndown Checklist

- [ ] T-022 — Empaquetado como app instalable
- [ ] T-023 — Versión móvil (APK / PWA)
- [ ] T-024 — Sincronización multi-dispositivo
- [ ] T-025 — CI/CD básico

**Métricas:** 0 / 4 tareas completadas (0%) — inicia al completar S3.

---

## Resumen de Salud del Proyecto

| Sprint | Tareas | Completadas | % | Estado |
|--------|--------|-------------|---|--------|
| S1 — MVP | 10 | 0 | 0% | 🔵 Pendiente |
| S2 — Análisis | 6 | 0 | 0% | ⚪ Bloqueado (espera S1) |
| S3 — IA | 5 | 0 | 0% | ⚪ Bloqueado (espera S2) |
| S4 — Deploy | 4 | 0 | 0% | ⚪ Bloqueado (espera S3) |
| **Total** | **25** | **0** | **0%** | |
