from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/users", json={
        "username": "test12",
        "email": "test12@test.com",
        "password": "test12test"
    })

    assert response.status_code == 200
