from infrastruktura.user_repository import UserRepository
from domena.user import User

repo = UserRepository()

def create_user(user: User):
    return repo.create(user)

def get_users():
    return repo.get_all()

def get_user(user_id: int):
    return repo.get_by_id(user_id)
