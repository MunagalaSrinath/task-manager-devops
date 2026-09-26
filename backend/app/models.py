from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str
    status: str = "TODO"


class TaskUpdate(BaseModel):
    title: str
    description: str
    status: str