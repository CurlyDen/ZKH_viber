from pydantic import BaseModel, FilePath
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
    blocks: dict
    links: dict

class MessageModel(BaseModel):
    num: int
    scenario: int
    text: str
    func: str
    coords: str

class KeyModel(BaseModel):
    num: int
    scenario: int
    text: str
    start: int
    end: int
