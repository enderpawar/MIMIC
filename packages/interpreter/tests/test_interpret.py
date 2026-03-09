"""
packages/interpreter 단위 테스트
실행: cd packages/interpreter && pytest tests/ -v
"""
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# ──────────────────────────────────────────────────────────────────────────────
# 샘플 데이터
# ──────────────────────────────────────────────────────────────────────────────

TWO_ACTIONS: list[dict] = [
    {
        "index": 0,
        "timestamp": 1700000000000,
        "kind": "navigate",
        "selector": "",
        "value": "https://example.com",
        "url": "https://example.com",
        "pageTitle": "Example",
    },
    {
        "index": 1,
        "timestamp": 1700000001000,
        "kind": "click",
        "selector": "#login-btn",
        "value": None,
        "url": "https://example.com",
        "pageTitle": "Example",
    },
]

# ──────────────────────────────────────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────────────────────────────────────


def test_health() -> None:
    """1. GET /health → {"status": "ok"}"""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@patch("services.interpret_service.settings")
def test_interpret_normal_with_mock(mock_settings: MagicMock) -> None:
    """2. 정상 액션 로그 (2개 액션) → InterpretResponse 형식 반환 (USE_MOCK=true)"""
    mock_settings.use_mock = True

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-normal", "actions": TWO_ACTIONS},
    )
    assert resp.status_code == 200
    body = resp.json()

    # InterpretResponse 형식 검증
    assert isinstance(body["workflow"]["id"], str) and body["workflow"]["id"]
    assert isinstance(body["workflow"]["nodes"], list) and len(body["workflow"]["nodes"]) >= 1
    assert isinstance(body["workflow"]["edges"], list)
    assert isinstance(body["confidence"], float)
    assert 0.0 <= body["confidence"] <= 1.0
    assert isinstance(body["warnings"], list)


def test_empty_actions_returns_422() -> None:
    """3. 빈 actions 배열 [] → 422 에러"""
    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-empty", "actions": []},
    )
    assert resp.status_code == 422


def test_missing_actions_returns_422() -> None:
    """4. actions 필드 자체가 없는 요청 → 422 에러"""
    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-no-actions"},
    )
    assert resp.status_code == 422


def test_missing_session_id_returns_422() -> None:
    """5. sessionId 없는 요청 → 422 에러"""
    resp = client.post(
        "/api/interpret",
        json={"actions": TWO_ACTIONS},
    )
    assert resp.status_code == 422
