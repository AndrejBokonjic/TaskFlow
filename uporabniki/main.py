from fastapi import FastAPI
from api.user_controller import router
from uporabniki.infrastruktura.logging_config import logger
from uporabniki.infrastruktura.database import engine, Base
import uporabniki.infrastruktura.user_model

app = FastAPI(title="User Service")

logger.info("User Service starting...")

Base.metadata.create_all(bind=engine)

app.include_router(router)