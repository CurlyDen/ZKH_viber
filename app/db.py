import sqlalchemy
from sqlalchemy import ForeignKeyConstraint, UniqueConstraint
import asyncio
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import JSON


DATABASE_URL = "postgresql+asyncpg://postgres:postgres@pgdb:5432/postgres"


engine = create_async_engine(DATABASE_URL, echo=True)
Base = declarative_base()
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)
async def init_models():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


class Message(Base):
    __tablename__ = "messages"

    id = sqlalchemy.Column(sqlalchemy.String)
    unique_id = sqlalchemy.Column(sqlalchemy.String, primary_key=True, index=True)
    scenario_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('scenarios.id', ondelete='CASCADE'), nullable=False, index=True)
    title = sqlalchemy.Column(sqlalchemy.String)
    text = sqlalchemy.Column(sqlalchemy.String)
    coords = sqlalchemy.Column(JSON)  
    style = sqlalchemy.Column(JSON)   
    type = sqlalchemy.Column(sqlalchemy.String)
    parent_id = sqlalchemy.Column(sqlalchemy.String, nullable=True)  

    __table_args__ = (
        UniqueConstraint('unique_id', name='unique_message_id'),
    )

class Key(Base):
    __tablename__ = "keys"
    id = sqlalchemy.Column(sqlalchemy.String)
    unique_id = sqlalchemy.Column(sqlalchemy.String, primary_key=True, index=True)
    scenario_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('scenarios.id', ondelete='CASCADE'), nullable=False, index=True)
    text = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    start = sqlalchemy.Column(sqlalchemy.String, nullable=False, index=True)
    end = sqlalchemy.Column(sqlalchemy.String, nullable=False, index=True)
    type = sqlalchemy.Column(sqlalchemy.String)

    __table_args__ = (
        UniqueConstraint('unique_id', name='unique_key_id'),
    )


class Scenario(Base):
    __tablename__ = "scenarios"
    id = sqlalchemy.Column(sqlalchemy.Integer, autoincrement=True, primary_key=True, index=True)
    title = sqlalchemy.Column(sqlalchemy.String, unique=True)
    blocks = sqlalchemy.Column(JSON)  
    links = sqlalchemy.Column(JSON) 
    functions = sqlalchemy.Column(JSON)

    