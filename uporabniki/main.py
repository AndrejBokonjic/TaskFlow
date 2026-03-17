from fastapi import FastAPI
from api.user_controller import router
from infrastruktura.logging_config import logger
from infrastruktura.database import engine, Base
import infrastruktura.user_model

app = FastAPI(title="User Service")

logger.info("User Service starting...")

Base.metadata.create_all(bind=engine)

app.include_router(router)