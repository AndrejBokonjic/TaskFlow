import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uporabniki.infrastruktura.database import Base
from uporabniki.infrastruktura import user_model
from uporabniki.infrastruktura.user_repository import UserRepository
from uporabniki.domena.user import User

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def override_db():
    import infrastruktura.database as db_module
    original = db_module.SessionLocal
    db_module.SessionLocal = TestingSessionLocal
    yield
    db_module.SessionLocal = original

def test_get_by_username():
    repo = UserRepository()

    user = User(username="findme", email="findme@test.com", password="pass")
    repo.create(user)

    found = repo.get_by_username("findme")

    assert found is not None
    assert found.username == "findme"

def test_get_by_id():
    repo = UserRepository()

    user = User(username="byid", email="byid@test.com", password="pass")
    created = repo.create(user)

    found = repo.get_by_id(created.id)

    assert found is not None
    assert found.id == created.id