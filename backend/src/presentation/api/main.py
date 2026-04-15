from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .habits_router import router as habits_router
from .metrics_router import router as metrics_router
from .score_router import router as score_router
from .tasks_router import router as tasks_router

app = FastAPI(
    title="Productivity App API",
    description="Personal habit tracker - Sprint 1 + Sprint 2",
    version="2.0.0",
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


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "2.0.0"}
