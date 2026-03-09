from pydantic import BaseModel, Field


class CapturedAction(BaseModel):
    index: int
    timestamp: int
    kind: str
    selector: str
    value: str | None = None
    url: str
    pageTitle: str


class InterpretRequest(BaseModel):
    sessionId: str = Field(min_length=1)
    actions: list[CapturedAction] = Field(min_length=1)


class WorkflowNode(BaseModel):
    id: str
    type: str
    label: str
    position: dict[str, float]
    action: dict | None = None
    trigger: dict | None = None
    condition: dict | None = None
    wait: dict | None = None
    data: dict | None = None


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class Workflow(BaseModel):
    id: str
    name: str
    nodes: list[WorkflowNode]
    edges: list[WorkflowEdge]
    variables: dict[str, str] = {}
    createdAt: str
    updatedAt: str


class InterpretResponse(BaseModel):
    workflow: Workflow
    confidence: float
    warnings: list[str] = []
