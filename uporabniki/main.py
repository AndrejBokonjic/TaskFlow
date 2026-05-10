# uporabniki/main.py
from fastapi import FastAPI
from uporabniki.api.user_controller import router
from uporabniki.api.health import router as health_router
from uporabniki.infrastruktura.logging_config import logger
from uporabniki.infrastruktura.database import engine, Base
import uporabniki.infrastruktura.user_model

app = FastAPI(title="User Service")

logger.info("User Service starting...")

Base.metadata.create_all(bind=engine)

app.include_router(router)
app.include_router(health_router)  # VZOREC: Health Check
