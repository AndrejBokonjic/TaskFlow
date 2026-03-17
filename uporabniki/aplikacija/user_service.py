from infrastruktura.user_repository import UserRepository
from domena.user import User
from infrastruktura.logging_config import logger

repo = UserRepository()

def create_user(user: User):
    return repo.create(user)

def get_users():
    return repo.get_all()

def get_user(user_id: int):
    return repo.get_by_id(user_id)

def register(user: User):
    logger.info(f"Registering user {user.username}")

    existing = repo.get_by_username(user.username)
    if existing:
        return None, "Username already taken"
    

    created = repo.create(user)
    return created, None

def login(username: str, password: str):
    logger.info(f"Login attempt for {username}")

    user = repo.get_by_username(username)
    if not user:
        return None, "User not found"

    if user.password != password:
        return None, "Wrong password"

    return user, None