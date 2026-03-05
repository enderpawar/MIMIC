"""
packages/interpreter 단위 테스트
실행: cd packages/interpreter && pytest tests/ -v
"""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
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

SAMPLE_ACTIONS: list[dict] = [
    {
        "index": 0,
        "timestamp": 1700000000000,
        "kind": "click",
        "selector": "#submit-btn",
        "value": None,
        "url": "https://example.com",
        "pageTitle": "Example",
    }
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
    """GET /health → {"status": "ok"}"""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@patch("services.interpret_service.settings")
@patch("services.interpret_service._client")
def test_interpret_mock_mode(mock_client: MagicMock, mock_settings: MagicMock) -> None:
    """USE_MOCK=true 시 하드코딩 샘플 반환 — Gemini API 호출 없음."""
    mock_settings.use_mock = True
    mock_settings.gemini_api_key = ""

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-mock", "actions": SAMPLE_ACTIONS},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["workflow"]["id"] == "mock-workflow-001"
    assert body["workflow"]["name"].startswith("[Mock]")
    mock_client.aio.models.generate_content.assert_not_called()


@patch("services.interpret_service._client")
def test_interpret_success(mock_client: MagicMock) -> None:
    """정상 ActionLog → Gemini 호출 → Workflow JSON 반환."""
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response(json.dumps(SAMPLE_WORKFLOW))
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-001", "actions": SAMPLE_ACTIONS},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["workflow"]["id"] == "test-id-001"
    assert body["confidence"] == 0.9
    assert isinstance(body["warnings"], list)


@patch("services.interpret_service._client")
def test_interpret_markdown_json(mock_client: MagicMock) -> None:
    """Gemini가 ```json 블록으로 응답해도 파싱 성공."""
    markdown_text = f"```json\n{json.dumps(SAMPLE_WORKFLOW)}\n```"
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response(markdown_text)
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-002", "actions": SAMPLE_ACTIONS},
    )
    assert resp.status_code == 200
    assert resp.json()["workflow"]["id"] == "test-id-001"


@patch("services.interpret_service._client")
def test_interpret_empty_actions(mock_client: MagicMock) -> None:
    """actions=[] → trigger만 있는 workflow 반환 시 200."""
    empty_workflow = {
        **SAMPLE_WORKFLOW,
        "id": "empty-001",
        "nodes": [SAMPLE_WORKFLOW["nodes"][0]],
        "edges": [],
    }
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response(json.dumps(empty_workflow))
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-003", "actions": []},
    )
    assert resp.status_code == 200
    assert resp.json()["workflow"]["id"] == "empty-001"


@patch("services.interpret_service._client")
def test_interpret_invalid_json_returns_422(mock_client: MagicMock) -> None:
    """Gemini가 JSON이 아닌 텍스트를 반환하면 422."""
    mock_client.aio.models.generate_content = AsyncMock(
        return_value=_make_gemini_response("이것은 JSON이 아닙니다.")
    )

    resp = client.post(
        "/api/interpret",
        json={"sessionId": "sess-004", "actions": SAMPLE_ACTIONS},
    )
    assert resp.status_code == 422
