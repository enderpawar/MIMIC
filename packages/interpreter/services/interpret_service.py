import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from google import genai
from google.genai import types

from models.settings import settings

if TYPE_CHECKING:
    from google.genai import Client

_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "interpret.txt"
SYSTEM_PROMPT: str = _PROMPT_PATH.read_text(encoding="utf-8")

_GEMINI_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
)

# API 키가 없는 환경(mock 모드)에서도 임포트 가능하도록 지연 초기화
_client: "Client | None" = None


def _get_client() -> "Client":
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise ValueError(
                "GEMINI_API_KEY 환경변수가 설정되지 않았습니다. "
                "실제 API 호출 시 필요합니다. mock 모드는 USE_MOCK=true 를 설정하세요."
            )
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ──────────────────────────────────────────────────────────────────────────────
# Mock 샘플 데이터 (USE_MOCK=true 시 반환)
# ──────────────────────────────────────────────────────────────────────────────

_MOCK_WORKFLOW: dict = {
    "id": "mock-workflow-001",
    "name": "[Mock] 샘플 워크플로우",
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
            "label": "페이지 이동",
            "position": {"x": 200, "y": 0},
            "action": {
                "kind": "navigate",
                "selector": "",
                "value": "https://example.com",
                "url": "https://example.com",
            },
        },
        {
            "id": "node-3",
            "type": "action",
            "label": "버튼 클릭",
            "position": {"x": 400, "y": 0},
            "action": {
                "kind": "click",
                "selector": "#submit-btn",
                "url": "https://example.com",
            },
        },
    ],
    "edges": [
        {"id": "e-1-2", "source": "node-1", "target": "node-2"},
        {"id": "e-2-3", "source": "node-2", "target": "node-3"},
    ],
    "variables": {},
    "createdAt": "",
    "updatedAt": "",
}


def _extract_json(text: str) -> str:
    """```json ... ``` 또는 ``` ... ``` 코드블록에서 JSON 문자열만 추출."""
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    return match.group(1) if match else text.strip()


async def interpret(actions: list[dict]) -> dict:
    if settings.use_mock:
        now = datetime.now(timezone.utc).isoformat()
        return {**_MOCK_WORKFLOW, "createdAt": now, "updatedAt": now}

    response = await _get_client().aio.models.generate_content(
        model="gemini-2.0-flash",
        contents=(
            f"다음 액션 로그를 워크플로우로 변환하세요:\n"
            f"{json.dumps(actions, ensure_ascii=False)}"
        ),
        config=_GEMINI_CONFIG,
    )
    raw: str = response.text  # type: ignore[assignment]
    return json.loads(_extract_json(raw))
