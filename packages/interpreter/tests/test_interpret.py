"""
packages/interpreter 단위 테스트
실행: cd packages/interpreter && pytest tests/ -v
"""
import json
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# ──────────────────────────────────────────────────────────────────────────────
# 샘플 데이터
# ──────────────────────────────────────────────────────────────────────────────

SAMPLE_WORKFLOW: dict = {
    "id": "test-id-001",
    "name": "테스트 워크플로우",
    "nodes": [
        {
            "id": "node-1",
            "type": "trigger",
            "label": "시작",
            "position": {"x": 0, "y": 0},
            "trigger": {"kind": "manual"},
        },
        {
            "id": "node-2",
            "type": "action",
            "label": "버튼 클릭",
            "position": {"x": 200, "y": 0},
            "action": {
                "kind": "click",
                "selector": "#submit-btn",
                "url": "https://example.com",
            },
        },
    ],
    "edges": [{"id": "edge-1", "source": "node-1", "target": "node-2"}],
    "variables": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
}

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


def _make_gemini_response(text: str) -> MagicMock:
    """Gemini 응답 객체 mock 생성."""
    mock_resp = MagicMock()
    mock_resp.text = text
    return mock_resp


# ──────────────────────────────────────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────────────────────────────────────


def test_health() -> None:
    """1. GET /health → {"status": "ok"}"""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@patch("services.interpret_service.settings")
@patch("services.interpret_service._client")
def test_interpret_normal_with_mock(mock_client: MagicMock, mock_settings: MagicMock) -> None:
    """2. 정상 액션 로그 (2개 액션) → InterpretResponse 형식 반환 (USE_MOCK=true), Gemini 미호출 검증."""
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

    # Gemini API 미호출 검증
    mock_client.aio.models.generate_content.assert_not_called()


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


@patch("services.interpret_service.settings")
@patch("services.interpret_service._client")
def test_interpret_markdown_json(mock_client: MagicMock, mock_settings: MagicMock) -> None:
    """6. Gemini가 ```json 블록으로 응답해도 파싱 성공 — _extract_json() 경로 검증."""
    mock_settings.use_mock = False
    markdown_text = f"```json\n{json.dumps(SAMPLE_WORKFLOW)}\n```"
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response(markdown_text)
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-markdown", "actions": TWO_ACTIONS},
    )
    assert resp.status_code == 200
    assert resp.json()["workflow"]["id"] == "test-id-001"


@patch("services.interpret_service.settings")
@patch("services.interpret_service._client")
def test_interpret_success(mock_client: MagicMock, mock_settings: MagicMock) -> None:
    """7. 정상 ActionLog → Gemini 호출 → Workflow JSON 반환."""
    mock_settings.use_mock = False
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response(json.dumps(SAMPLE_WORKFLOW))
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-success", "actions": TWO_ACTIONS},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["workflow"]["id"] == "test-id-001"
    assert body["confidence"] == 0.9
    assert isinstance(body["warnings"], list)
