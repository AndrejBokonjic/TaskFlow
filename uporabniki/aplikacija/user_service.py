from uporabniki.infrastruktura.user_repository import UserRepository
from uporabniki.domena.user import User
from uporabniki.infrastruktura.logging_config import logger
import bcrypt

def _get_repo():
    return UserRepository()

def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_user(user: User):
    user.password = _hash_password(user.password)
    return _get_repo().create(user)

def get_users():
    return _get_repo().get_all()

def get_user(user_id: int):
    return _get_repo().get_by_id(user_id)

def update_user(user_id: int, username: str = None, email: str = None, password: str = None):
    logger.info(f"Updating user {user_id}")
    repo = _get_repo()
    user = repo.get_by_id(user_id)
    if not user:
        return None, "User not found"
    if username:
        existing = repo.get_by_username(username)
        if existing and existing.id != user_id:
            return None, "Username already taken"
        user.username = username
    if email:
        user.email = email
    if password:
        user.password = _hash_password(password)
    updated = repo.update(user)
    return updated, None

def delete_user(user_id: int):
    logger.info(f"Deleting user {user_id}")
    return _get_repo().delete(user_id)

def register(user: User):
    logger.info(f"Registering user {user.username}")
    repo = _get_repo()
    existing = repo.get_by_username(user.username)
    if existing:
        return None, "Username already taken"
    user.password = _hash_password(user.password)
    created = repo.create(user)
    return created, None

def login(username: str, password: str):
    logger.info(f"Login attempt for {username}")
    repo = _get_repo()
    user = repo.get_by_username(username)
    if not user:
        return None, "User not found"
    if not _verify_password(password, user.password):
        return None, "Wrong password"
    return user, None
