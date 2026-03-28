from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uporabniki.domena.user import User
from uporabniki.aplikacija.user_service import create_user, get_users, get_user, register, login
from uporabniki.infrastruktura.logging_config import logger

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/users")
def create(user: User):
    logger.info(f"Creating user {user.username}")
    return create_user(user)

@router.get("/users")
def list_users():
    logger.info("Fetching all users")
    return get_users()

@router.get("/users/{user_id}")
def get(user_id: int):
    logger.info(f"Fetching user {user_id}")
    return get_user(user_id)

@router.post("/auth/register")
def register_user(user: User):
    logger.info(f"Register request for {user.username}")
    created, error = register(user)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return created

@router.post("/auth/login")
def login_user(request: LoginRequest):
    logger.info(f"Login request for {request.username}")
    user, error = login(request.username, request.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    return {"message": "Login successful", "user_id": user.id, "username": user.username}