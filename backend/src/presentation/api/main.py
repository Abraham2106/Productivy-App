from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .habits_router import router as habits_router
from .metrics_router import router as metrics_router
from .score_router import router as score_router
from .tasks_router import router as tasks_router
from .coach_router import router as coach_router
from .focus_router import router as focus_router
from .patterns_router import router as patterns_router

app = FastAPI(
    title="Productivity App API",
    description="Personal habit tracker - Sprint 3 (Adaptive AI)",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)
app.include_router(score_router)
app.include_router(metrics_router)
app.include_router(habits_router)
app.include_router(coach_router)
app.include_router(focus_router)
app.include_router(patterns_router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "2.0.0"}
