from fastapi import FastAPI
from api.user_controller import router
from infrastruktura.logging_config import logger

app = FastAPI(title="User Service")

logger.info("User Service starting...")

app.include_router(router)
