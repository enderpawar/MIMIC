from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models.settings import settings
from routers.interpret import router as interpret_router

app = FastAPI(title="FlowCap Interpreter", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interpret_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
