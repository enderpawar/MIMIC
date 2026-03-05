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
        return InterpretResponse(workflow=workflow, confidence=0.9)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
