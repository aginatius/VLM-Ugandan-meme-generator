from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(title="Ugandan Meme Generator")
app.include_router(router, prefix="/api")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
