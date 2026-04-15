# Resumen de Ejecucion - Sprint 2

Este sprint marca el paso de una base enfocada en tareas y score diario hacia una iteracion con metricas diarias, analitica semanal y deteccion de habitos. El alcance amplía backend, frontend, pruebas y documentacion para sostener una experiencia mas rica y orientada al seguimiento del progreso.

## 1. Arquitectura Backend

Se extendio la arquitectura limpia del backend para soportar metricas y analitica sin romper la separacion entre dominio, infraestructura y presentacion.

### Capas implementadas:
- **Domain:**
  - Nuevas entidades: `DailyMetrics`, `WeeklyScore`, `HabitPattern`.
  - Nuevas interfaces para metricas, habitos y score diario.
  - Nuevos servicios: `MetricsService` y `AnalyticsService`.
- **Infrastructure:**
  - Repositorios Supabase para metricas, habitos y score diario.
  - `RuleBasedStrategy` ahora considera metricas opcionales junto con las tareas.
- **Presentation:**
  - Nuevos endpoints REST: `/metrics/today`, `/score/week`, `/score/trend`, `/habits`.
  - Actualizacion de la API a la version `2.0.0`.
- **Base de datos:**
  - `database.sql` agrega la tabla `habit_patterns` y su indice.

## 2. Frontend

La interfaz evoluciona para mostrar informacion diaria y semanal con mas contexto visual y funcional.

### Caracteristicas principales:
- **Metricas diarias:**
  - Nuevo componente `MetricsCard` para registrar sueno, uso de celular y estudio.
- **Analitica semanal:**
  - `WeeklyView` suma tarjetas resumen, grafico semanal y desglose diario.
- **Habitos detectados:**
  - Nuevo componente `HabitPatternsCard` para clasificar patrones positivos, negativos o neutrales.
- **Logica de score ampliada:**
  - `metricScoring.ts` complementa el calculo del score con datos de metricas.
- **Estado local enriquecido:**
  - `useTasks` guarda metricas en `localStorage`, calcula score con metricas y arma datos semanales e insights de habitos.

## 3. Pruebas y Verificacion

Se reforzo la cobertura para validar la nueva logica de negocio y la persistencia agregada.

### Backend:
- Tests unitarios para `AnalyticsService`.
- Tests unitarios para scoring con metricas.
- Ajustes en `TaskService` para validar recalculo y persistencia del score diario.
- Test de integracion para `SupabaseMetricsRepository`.

### Cobertura observada:
- La logica nueva queda bien respaldada en servicios y repositorios.
- No se agregan pruebas directas de routers ni un flujo completo frontend-backend.

## 4. Documentacion

Se agrego documentacion especifica para apoyar la implementacion y el seguimiento del sprint.

- `Guides/UI_S2.md`
- `Sprints/Sprint2.md`
- `SPRINT_1_RESUMEN.md`

Estos archivos describen el alcance visual y funcional del Sprint 2, junto con el estado actual de la aplicacion.

## 5. Como Ejecutar

- **Backend:** `cd backend` y `uvicorn src.presentation.api.main:app --reload`
- **Pruebas backend:** `cd backend` y `pytest`
- **Frontend:** `cd frontend` y `npm run dev`
- **Build frontend:** `cd frontend` y `npm run build`

---
Sprint 2 deja lista la base para una experiencia con mayor analitica y seguimiento de habitos, aunque el frontend de este commit todavia operaba con estado local y no con una integracion real a Supabase.
