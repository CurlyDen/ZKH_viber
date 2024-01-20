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

async def add_scenario(session: AsyncSession, scenario: Scenario):
    new_scenario = Scenario(
        id=scenario.id,
        title=scenario.title,
        blocks=scenario.blocks,
        links=scenario.links,
        functions=scenario.functions
    )

    session.add(new_scenario)
    return new_scenario
 

async def delete_scenario(session: AsyncSession, id: int):
    result = await session.execute(delete(Scenario).where(Scenario.id==id))
    return result

async def update_scenario(session: AsyncSession, id: int, title: str):
    result = await session.execute(update(Scenario).where(Scenario.id==id).values(title=title))
    return result


# Messages
async def get_messages(session: AsyncSession, scenario_id: int) -> list[Message]:
    result = await session.execute(select(Message).where(Message.scenario_id == scenario_id))
    return result.scalars().all()

async def get_message(session: AsyncSession, scenario_id: int, title: str) -> Message:
    result = await session.execute(select(Message).where((Message.scenario_id == scenario_id) & (Message.id == id)))
    return result.scalars().first()

async def get_message_by_id(session: AsyncSession, id: str) -> Message:
    result = await session.execute(select(Message).where(Message.id == id))
    return result.scalars().first()

async def add_message(session: AsyncSession, id: str, scenario_id: int, title: str, text: str, coords: dict, style: dict, type: str, parent_id: Optional[dict] = None) -> Message:
    new_message = Message(id=id, scenario_id=scenario_id, title=title, text=text, coords=coords, style=style, type=type, parent_id=parent_id)
    session.add(new_message)
    return new_message

async def delete_message(session: AsyncSession, id: str) -> None:
    result = await session.execute(delete(Message).where(Message.id == id))
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

async def get_keys_by_message(session: AsyncSession, start: int) -> list[Key]:
    result = await session.execute(select(Key).where(Key.start == start))
    return result.scalars().all()

async def get_key(session: AsyncSession, scenario_id: int, id: int) -> Key:
    result = await session.execute(select(Key).where((Key.scenario_id == scenario_id) & (Key.id == id)))
    return result.scalars().first()

async def add_key(session: AsyncSession, scenario_id: int, text: str, start: int, end: int, type: str) -> Key:
    new_key = Key(scenario_id=scenario_id, text=text, start=start, end=end, type=type)
    session.add(new_key)
    return new_key

async def delete_key(session: AsyncSession, id: int) -> None:
    result = await session.execute(delete(Key).where(Key.id == id))
    return result

async def delete_keys_of_scenario(session: AsyncSession, scenario_id: int) -> None:
    result = await session.execute(delete(Key).where(Key.scenario_id == scenario_id))
    return result

async def update_key(session: AsyncSession, scenario_id: int, id: int, text: str, start: int, end: int, type: str) -> None:
    result = await session.execute(update(Key).where((Key.scenario_id == scenario_id) & (Key.id == id)).values(text=text, start=start, end=end, type=type))
    return result
