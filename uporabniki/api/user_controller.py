from fastapi import APIRouter
from domena.user import User
from aplikacija.user_service import create_user, get_users, get_user

router = APIRouter()

@router.post("/users")
def create(user: User):
    return create_user(user)

@router.get("/users")
def list_users():
    return get_users()

@router.get("/users/{user_id}")
def get(user_id: int):
    return get_user(user_id)
