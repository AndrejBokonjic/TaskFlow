from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from uporabniki.domena.user import User
from uporabniki.aplikacija.user_service import create_user, get_users, get_user, update_user, delete_user, register, login
from uporabniki.infrastruktura.logging_config import logger

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

def safe_user(user):
    return {"id": user.id, "username": user.username, "email": user.email}

@router.post("/users")
def create(user: User):
    logger.info(f"Creating user {user.username}")
    return safe_user(create_user(user))

@router.get("/users")
def list_users():
    return [safe_user(u) for u in get_users()]

@router.get("/users/{user_id}")
def get(user_id: int):
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return safe_user(user)

@router.put("/users/{user_id}")
def update(user_id: int, body: UpdateUserRequest):
    logger.info(f"Update request for user {user_id}")
    updated, error = update_user(user_id, body.username, body.email, body.password)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return safe_user(updated)

@router.delete("/users/{user_id}", status_code=204)
def delete(user_id: int):
    logger.info(f"Delete request for user {user_id}")
    success = delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")

@router.post("/auth/register")
def register_user(user: User):
    logger.info(f"Register request for {user.username}")
    created, error = register(user)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return safe_user(created)

@router.post("/auth/login")
def login_user(request: LoginRequest):
    logger.info(f"Login request for {request.username}")
    user, error = login(request.username, request.password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    return {"message": "Login successful", "user_id": user.id, "username": user.username}
