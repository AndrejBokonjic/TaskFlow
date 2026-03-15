from fastapi import FastAPI
from api.user_controller import router

app = FastAPI(title="User Service")

app.include_router(router)
