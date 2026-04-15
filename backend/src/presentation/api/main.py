from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .tasks_router import router as tasks_router
from .score_router import router as score_router

app = FastAPI(
    title="Productivity App API",
    description="Personal habit tracker — Sprint 1",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — open in development; restrict origins in production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(tasks_router)
app.include_router(score_router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "1.0.0"}
