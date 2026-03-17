from infrastruktura.user_repository import UserRepository
from domena.user import User

def test_create_user():
    repo = UserRepository()

    user = User(username="test12", email="test12@test.com", password="test12test")

    created = repo.create(user)

    assert created.id == 1