from fastapi import APIRouter
from domena.user import User
from aplikacija.user_service import create_user, get_users, get_user
from infrastruktura.logging_config import logger

router = APIRouter()

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
