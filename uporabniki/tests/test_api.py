from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/users", json={
        "username": "test",
        "email": "test@test.com"
    })

    assert response.status_code == 200
