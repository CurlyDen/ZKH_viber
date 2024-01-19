from pydantic import BaseModel, FilePath, Optional, Dict
from typing import Literal

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
class ScenarioModel(BaseModel):
    title: str
    id: int
    blocks: list
    links: list
    functions: list

class MessageModel(BaseModel):
    id: str
    scenario_id: int
    title: str
    text: Optional[str] = None
    coords: Dict[str, int]  
    style: Dict[str]
    type: str
    parent_id: Optional[Dict[str]] = None

class KeyModel(BaseModel):
    id: str
    scenario_id: int
    text: str
    start: str
    end: str
    type: str
