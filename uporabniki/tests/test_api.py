import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uporabniki.infrastruktura.database import Base
from uporabniki.infrastruktura import user_model
from main import app

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

client = TestClient(app)

def test_create_user():
    response = client.post("/users", json={
        "username": "Marko454",
        "email": "marko1443@test.com",
        "password": "test444test"
    })

    assert response.status_code == 200

def test_register_user():
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@test.com",
        "password": "newpassword"
    })

    assert response.status_code == 200

def test_register_duplicate_username():
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

def test_login_success():
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

def test_login_wrong_password():
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