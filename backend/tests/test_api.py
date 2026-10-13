from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_endpoint_returns_200():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert "uptime_seconds" in data
    assert "version" in data
    assert "environment" in data


def test_health_endpoint_returns_valid_uptime():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["uptime_seconds"] >= 0


def test_unknown_endpoint_returns_structured_error():
    response = client.get("/api/endpoint-that-does-not-exist")

    assert response.status_code == 404

    data = response.json()

    assert data["error"] == "not_found"
    assert data["status_code"] == 404


def test_response_includes_process_time_header():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert "X-Process-Time-Ms" in response.headers

    process_time = float(response.headers["X-Process-Time-Ms"])
    assert process_time >= 0