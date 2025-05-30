import json
from typing import Optional
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from db import *

# Scenarios
async def get_scenarios(session: AsyncSession) -> list[Scenario]:
    result = await session.execute(select(Scenario).order_by(Scenario.id))
    return result.scalars().all()

async def get_scenario(session: AsyncSession, id: int) -> Scenario:
    result = await session.execute(select(Scenario).where(Scenario.id==id))
    return result.scalars().first()

async def add_scenario(session: AsyncSession, scenario: Scenario, functions: list):
    new_scenario = Scenario(
        id=scenario.id,
        title=scenario.title,
        blocks=scenario.blocks,
        links=scenario.links,
        functions=functions
    )

    session.add(new_scenario)
    return new_scenario
 

async def delete_scenario(session: AsyncSession, id: int):
    result = await session.execute(delete(Scenario).where(Scenario.id==id))
    return result

async def update_scenario(session: AsyncSession, id: int, title: str, functions: json):
    result = await session.execute(update(Scenario).where(Scenario.id==id).values(title=title, functions=functions))
    return result


# Messages
async def get_messages(session: AsyncSession, scenario_id: int) -> list[Message]:
    result = await session.execute(select(Message).where(Message.scenario_id == scenario_id))
    return result.scalars().all()

async def get_buttons(session: AsyncSession, scenario_id: int, mess_id: int) -> list[Message]:
    result = await session.execute(select(Message).where((Message.scenario_id == scenario_id) & (Message.id.like(f'{mess_id}-tree-%'))))
    return result.scalars().all()

async def get_message_by_type(session: AsyncSession, scenario_id: int, type: str) -> Message:
    result = await session.execute(select(Message).where((Message.type == type) & (Message.scenario_id == scenario_id)))
    return result.scalars().first()

async def get_message_by_id(session: AsyncSession, unique_id: str) -> Message:
    result = await session.execute(select(Message).where(Message.unique_id == unique_id))
    return result.scalars().first()

async def get_menu_message(session: AsyncSession, scenario_id: int) -> Message:
    result = await session.execute(select(Message).where((Message.scenario_id == scenario_id) & (Message.title == 'Меню')))
    return result.scalars().first()
    

async def add_message(session: AsyncSession, id: str, scenario_id: int, title: str, text: str, coords: dict, style: dict, type: str, parent_id: Optional[dict] = None) -> Message:
    new_message = Message(unique_id=(id + '#' + str(scenario_id)), id=id, scenario_id=scenario_id, title=title, text=text, coords=coords, style=style, type=type, parent_id=parent_id)
    session.add(new_message)
    return new_message

async def delete_message(session: AsyncSession, scenario_id: int, id: str) -> None:
    result = await session.execute(delete(Message).where((Message.id == id) & (Message.scenario_id == scenario_id)))
    return result

async def delete_messages_of_scenario(session: AsyncSession, scenario_id: int) -> None:
    result = await session.execute(delete(Message).where(Message.scenario_id == scenario_id))
    return result

async def update_message(session: AsyncSession, title: str, scenario_id: int, text: str, coords: dict, style: dict, type: str, parent_id: Optional[dict] = None) -> None:
    result = await session.execute(update(Message).where((Message.scenario_id == scenario_id) & (Message.title == title)).values(text=text, coords=coords, style=style, type=type, parent_id=parent_id))
    return result

# Keys

async def get_keys(session: AsyncSession, scenario_id: int) -> list[Key]:
    result = await session.execute(select(Key).where(Key.scenario_id == scenario_id))
    return result.scalars().all()

async def get_keys_by_start_message(session: AsyncSession, scenario_id: int, start: str) -> list[Key]:
    result = await session.execute(select(Key).where(((Key.start == str(start)) | Key.start.like(f'{start}-tree-%')) & (Key.scenario_id == scenario_id) & (Key.start != Key.end)).order_by(Key.start))
    return result.scalars().all()

async def get_keys_by_end_message(session: AsyncSession, scenario_id: int, end: str) -> list[Key]:
    result = await session.execute(select(Key).where((Key.end == end) & (Key.scenario_id == scenario_id)))
    return result.scalars().all()

async def get_key(session: AsyncSession, unique_id: str) -> Key:
    result = await session.execute(select(Key).where(Key.unique_id == unique_id))
    return result.scalars().first()

async def add_key(session: AsyncSession, id: str, scenario_id: int, text: str, start: int, end: int, type: str) -> Key:
    new_key = Key(unique_id=(id + '#' + str(scenario_id)), id=id, scenario_id=scenario_id, text=text, start=start, end=end, type=type)
    session.add(new_key)
    return new_key

async def delete_key(session: AsyncSession, unique_id: str) -> None:
    result = await session.execute(delete(Key).where(Key.unique_id == unique_id))
    return result

async def delete_keys_of_scenario(session: AsyncSession, scenario_id: int) -> None:
    result = await session.execute(delete(Key).where(Key.scenario_id == scenario_id))
    return result

async def update_key(session: AsyncSession, unique_id: str, text: str, start: int, end: int, type: str) -> None:
    result = await session.execute(update(Key).where(Key.unique_id == unique_id).values(text=text, start=start, end=end, type=type))
    return result

# User
async def add_user(session: AsyncSession, id: str, scenario_id: int, foreign_id: str) -> User:
    new_user = User(id=(id + '#' + str(scenario_id)), scenario_id=scenario_id, foreign_id=foreign_id, role='user')
    session.add(new_user)
    return new_user

async def get_user_by_fid(session: AsyncSession, fid: str, scenario: int) -> User:
    result = await session.execute(select(User).where((User.foreign_id == fid) & (User.scenario_id == scenario)))
    return result.scalars().first()

async def get_user(session: AsyncSession, id: str) -> User:
    result = await session.execute(select(User).where((User.id == id)))
    return result.scalars().first()

async def upd_user(session: AsyncSession, id: str, fid: str) -> User:
    result = await session.execute(select(User).where((User.id == id)))
    user = result.scalars().first()
    if user is None:
        id, scenario = id.split('#')
        user = add_user(session, id, scenario, fid)
    else:
        user.foreign_id = fid
    session.commit()
    return user