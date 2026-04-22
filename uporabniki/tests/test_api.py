import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uporabniki.infrastruktura.database as db_module
from uporabniki.infrastruktura.database import Base
from uporabniki.infrastruktura import user_model

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

@pytest.fixture
def client(isolated_db):
    from uporabniki.main import app
    return TestClient(app)

def test_create_user(client):
    response = client.post("/users", json={
        "username": "Marko454",
        "email": "marko1443@test.com",
        "password": "test444test"
    })
    assert response.status_code == 200

def test_register_user(client):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "newpassword"
    })
    assert response.status_code == 200

def test_register_duplicate_username(client):
    client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup1@test.com",
        "password": "pass"
    })
    response = client.post("/auth/register", json={
        "username": "dupuser",
        "email": "dup2@test.com",
        "password": "pass"
    })
    assert response.status_code == 400

def test_login_success(client):
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "login@test.com",
        "password": "mypassword"
    })
    response = client.post("/auth/login", json={
        "username": "loginuser",
        "password": "mypassword"
    })
    assert response.status_code == 200

def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "username": "wrongpass",
        "email": "wrongpass@test.com",
        "password": "correctpassword"
    })
    response = client.post("/auth/login", json={
        "username": "wrongpass",
        "password": "wrongpassword"
    })
    assert response.status_code == 401