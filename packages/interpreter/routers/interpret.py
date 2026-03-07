import json

from fastapi import APIRouter, HTTPException

from models.schemas import InterpretRequest, InterpretResponse, Workflow
from services.interpret_service import interpret

router = APIRouter()


@router.post("/api/interpret", response_model=InterpretResponse)
async def interpret_route(body: InterpretRequest) -> InterpretResponse:
    try:
        actions = [a.model_dump() for a in body.actions]
        result = await interpret(actions)
        workflow = Workflow(**result)
        warnings: list[str] = result.get("warnings", [])
        return InterpretResponse(workflow=workflow, confidence=0.9, warnings=warnings)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=422, detail=f"Gemini 응답 JSON 파싱 실패: {exc}"
        ) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
