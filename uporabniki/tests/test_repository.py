from infrastruktura.user_repository import UserRepository
from domena.user import User

def test_create_user():
    repo = UserRepository()

    user = User(username="test", email="test@test.com")

    created = repo.create(user)

    assert created.id == 1