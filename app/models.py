from pydantic import BaseModel, FilePath
from typing import Literal, Optional


# Bot
class UserModel(BaseModel):
    name: str
    phone: int
    id_1c: str
    id_viber: str
    role: Literal['user', 'cleaning', 'security']

class EpayModel(BaseModel):
    user: UserModel
    epay: int
    label: str

class ApplicationModel(BaseModel):
    text: str
    media: FilePath
    place: str
    role: Literal['cleaning', 'security']


# Scenario editor


class MessageModel(BaseModel):
    unique_id: str
    id: str
    unique_id: str
    scenario_id: int
    title: str
    text: Optional[str] = ""
    coords: dict
    style: dict
    type: str
    parent_id: Optional[str] = None

class KeyModel(BaseModel):
    unique_id: str
    id: str
    scenario_id: int
    text: str
    start: str
    end: str
    type: str

class ScenarioModel(BaseModel):
    id: int
    title: str
    blocks: list
    links: list
    functions: list
