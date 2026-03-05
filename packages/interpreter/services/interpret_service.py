import json
from pathlib import Path

import anthropic

from models.settings import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "interpret.txt"
SYSTEM_PROMPT: str = _PROMPT_PATH.read_text(encoding="utf-8")


async def interpret(actions: list[dict]) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    f"다음 액션 로그를 워크플로우로 변환하세요:\n"
                    f"{json.dumps(actions, ensure_ascii=False)}"
                ),
            }
        ],
    )
    raw: str = response.content[0].text  # type: ignore[index]
    return json.loads(raw)
