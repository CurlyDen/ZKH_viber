from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from db import *

# Scenarios
async def get_scenarios(session: AsyncSession) -> list[Scenario]:
    result = await session.execute(select(Scenario).order_by(Scenario.id.desc()))
    return result.scalars().all()

async def get_scenario(session: AsyncSession, id: int) -> Scenario:
    result = await session.execute(select(Scenario).where(Scenario.id==id))
    return result.scalars().first()

async def add_scenario(session: AsyncSession, title: str):
    new_scenario = Scenario(title=title)
    session.add(new_scenario)
    return new_scenario

async def delete_scenario(session: AsyncSession, id: int):
    result = await session.execute(delete(Scenario).where(Scenario.id==id))
    return result

async def update_scenario(session: AsyncSession, id: int, title: str):
    result = await session.execute(update(Scenario).where(Scenario.id==id).values(title=title))
    return result


# Messages
async def get_messages(session: AsyncSession, scenario: int) -> list[Message]:
    result = await session.execute(select(Message).where(Message.scenario==scenario))
    return result.scalars().all()

async def get_message(session: AsyncSession, scenario: int, num: int) -> list[Message]:
    result = await session.execute(select(Message).where(Message.scenario == scenario and Message.num == num))
    return result.scalars().first()

async def get_message_by_id(session: AsyncSession, id: int) -> list[Message]:
    result = await session.execute(select(Message).where(Message.id == id))
    return result.scalars().first()

async def add_message(session: AsyncSession, num: int, scenario: int, text: str, func: str, coords: str):
    new_message = Message(num=num, scenario=scenario, text=text, func=func, coords=coords)
    session.add(new_message)
    return new_message

async def delete_message(session: AsyncSession, id: int):
    result = await session.execute(delete(Message).where(Message.id==id))
    return result

async def delete_messages_of_scenario(session: AsyncSession, scenario: int):
    result = await session.execute(delete(Message).where(Message.scenario==scenario))
    return result

async def update_message(session: AsyncSession, num: int, scenario: int, text: str, func: str, coords: str):
    result = await session.execute(update(Message).where(Message.scenario == scenario and Message.num == num).values(text=text, func=func, coords=coords))
    return result


# Keys
async def get_keys(session: AsyncSession, scenario: int) -> list[Key]:
    result = await session.execute(select(Key).where(Key.scenario==scenario))
    return result.scalars().all()

async def get_keys_by_message(session: AsyncSession, message: int) -> list[Key]:
    result = await session.execute(select(Key).where(Key.start==message))
    return result.scalars().all()

async def get_key(session: AsyncSession, scenario: int, num: int) -> list[Message]:
    result = await session.execute(select(Key).where(Key.scenario == scenario and Key.num == num))
    return result.scalars().first()

async def add_key(session: AsyncSession, num: int, scenario: int, text: str, start: int, end: int):
    new_key = Key(num=num, scenario=scenario, text=text, start=start, end=end)
    session.add(new_key)
    return new_key

async def delete_key(session: AsyncSession, id: int):
    result = await session.execute(delete(Key).where(Key.id==id))
    return result

async def delete_keys_of_scenario(session: AsyncSession, scenario: int):
    result = await session.execute(delete(Key).where(Key.scenario==scenario))
    return result

async def update_key(session: AsyncSession, num: int, scenario: int, text: str, start: int, end: int):
    result = await session.execute(update(Key).where(Key.scenario == scenario and Key.num == num).values(text=text, start=start, end=end))
    return result