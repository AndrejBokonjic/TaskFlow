import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uporabniki.infrastruktura.database as db_module
from uporabniki.infrastruktura.database import Base
from uporabniki.infrastruktura import user_model
from uporabniki.infrastruktura.user_repository import UserRepository
from uporabniki.domena.user import User

@pytest.fixture(autouse=True)
def isolated_db(tmp_path):
    db_file = tmp_path / "test.db"
    url = f"sqlite:///{db_file}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    original_session = db_module.SessionLocal
    original_engine = db_module.engine
    db_module.SessionLocal = TestingSessionLocal
    db_module.engine = engine
    yield
    db_module.SessionLocal = original_session
    db_module.engine = original_engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

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

def test_update_user():
    repo = UserRepository()
    user = User(username="updateme", email="update@test.com", password="pass")
    created = repo.create(user)
    created.email = "new@test.com"
    updated = repo.update(created)
    assert updated.email == "new@test.com"

def test_delete_user():
    repo = UserRepository()
    user = User(username="deleteme", email="delete@test.com", password="pass")
    created = repo.create(user)
    result = repo.delete(created.id)
    assert result is True
    assert repo.get_by_id(created.id) is None