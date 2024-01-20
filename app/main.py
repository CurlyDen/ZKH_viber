import re
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
import json
from fastapi.openapi.utils import get_openapi
from sending import send_text
from models import MessageModel, KeyModel, ScenarioModel
from db import get_session, AsyncSession, engine, Base
import db_utility, settings

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.ext.asyncio import AsyncSession




num_format = re.compile("^[\-]?[1-9][0-9]*\.?[0-9]+$")

app = FastAPI(docs_url="/mc_viber/docs", redoc_url="/mc_viber/redoc")

functions = ['Считать']

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # замените "*" на список разрешенных доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.on_event("startup")
# async def startup_event():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.drop_all)
#         await conn.run_sync(Base.metadata.create_all)

@app.get("/mc_viber/messages/{id}", response_model=list[MessageModel])
async def get_messages(id: int, session: AsyncSession = Depends(get_session)):
    messages = await db_utility.get_messages(session, id)
    return [MessageModel(id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

@app.get("/mc_viber/links/{id}", response_model=list[KeyModel])
async def get_links(id: int, session: AsyncSession = Depends(get_session)):
    keys = await db_utility.get_keys(session, id)
    return [KeyModel(id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

@app.get("/mc_viber/canvas", response_model=list[ScenarioModel])
async def get_scenarios(session: AsyncSession = Depends(get_session)):
    scenarios = await db_utility.get_scenarios(session)

    data = []
    for s in scenarios:
        messages = await db_utility.get_messages(session, s.id)
        blocks = [MessageModel(id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

        keys = await db_utility.get_keys(session, s.id)
        links = [KeyModel(id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

        data.append(ScenarioModel(title=s.title, id=s.id, blocks=blocks, links=links, functions=functions))

    return data



@app.post("/mc_viber/canvas")
async def add_scenario(scenario: ScenarioModel, session: AsyncSession = Depends(get_session)):
    scenario = await db_utility.add_scenario(session, scenario, functions)
    try:
        await session.commit()
        start_message = await db_utility.add_message(session, scenario.blocks[0]["id"], scenario.id, scenario.blocks[0]["title"], scenario.blocks[0]["text"], scenario.blocks[0]["coords"], scenario.blocks[0]["style"], scenario.blocks[0]["type"], scenario.blocks[0]["parent_id"])
        end_message = await db_utility.add_message(session, scenario.blocks[1]["id"], scenario.id, scenario.blocks[1]["title"], scenario.blocks[1]["text"], scenario.blocks[1]["coords"], scenario.blocks[1]["style"], scenario.blocks[1]["type"], scenario.blocks[1]["parent_id"])
        await session.commit()
        return scenario 
    except IntegrityError as ex:
        await session.rollback()
        raise HTTPException(status_code=400, detail="The scenario is already stored")


@app.get("/mc_viber/canvas/{id}", response_model=ScenarioModel)
async def read_scenario(request: Request, id: int, session: AsyncSession = Depends(get_session)):
    scenario = await db_utility.get_scenario(session, id)
    
    messages = await db_utility.get_messages(session, scenario.id)
    blocks = [MessageModel(id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

    keys = await db_utility.get_keys(session, scenario.id)
    links = [KeyModel(id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

    return ScenarioModel(title=scenario.title, id=scenario.id, blocks=blocks, links=links, functions=functions)

@app.post("/mc_viber/canvas/{id}")
async def save_scenario(request: Request, id: int, status_code=200, session: AsyncSession = Depends(get_session)):
    data = await request.json()
    sc_id = int(data['scenario'])
    
    # Delete existing messages and keys of the scenario
    await db_utility.delete_messages_of_scenario(session, sc_id)
    await db_utility.delete_keys_of_scenario(session, sc_id)
    
    await session.commit()

    num_to_id = {}
    
    # Add new messages
    for block_id, block_data in data['blocks'].items():
        mess = await db_utility.add_message(
            session,
            id=int(block_id),
            scenario_id=sc_id,
            text=block_data['text'],
            title=block_data.get('title', ''),  # Assuming you have a 'title' field in MessageModel
            coords=block_data['coords'],
            style=block_data['style'],
            type=block_data['type'],
            parent_id=block_data.get('parent_id'),
        )
        await session.commit()
        num_to_id[int(block_id)] = mess.id

    # Add new keys
    for link_id, link_data in data['links'].items():
        start = num_to_id[int(link_data['start'])]
        end = num_to_id[int(link_data['end'])]
        await db_utility.add_key(
            session,
            id=int(link_id),
            scenario_id=sc_id,
            text=link_data['text'],
            start=start,
            end=end,
            type=link_data['type'],
        )

    try:
        await session.commit()
        return 'ok'
    except IntegrityError as ex:
        print(ex)
        await session.rollback()
        raise HTTPException(status_code=400, detail="Duplicate scenario")

# @app.get("/mc_viber/webhook_viber")
# async def viber_bot(request: Request, session: AsyncSession = Depends(get_session)):
#     viber = await request.json()
#     if viber['event'] == 'failed':
#         return JSONResponse(content={"message": viber}, status_code=500)
#     elif viber['event'] == 'unsubscribed':
#         print('Отписка', viber)
#     elif viber['event'] == 'conversation_started':
#         print('Начнём', viber)
#         await conversation(viber, session)
#     elif viber['event'] == 'message':
#         await message(viber, session)
#     else:
#         print(viber['event'])
#     return {"message": "OK"}

# async def conversation(viber, session):
#     try:
#         id = viber['user']['id']
#     except:
#         id = viber['sender']['id']
#     st_mess = await db_utility.get_message(session, settings.SCENARIO, -1)
#     link = await db_utility.get_keys_by_message(session, st_mess.id)
#     print(st_mess.num, st_mess.text)
#     ans = await mess_handler(link[0].end, session)
#     send_text(id, str(ans['text']), ans['track'], ans['keys'])

# async def message(viber, session):
#     if 'tracking_data' not in viber['message']:
#         await conversation(viber, session)
#     else:
#         id = viber['sender']['id']
#         track_data = viber['message']['tracking_data'].split('\n')
#         print(track_data)
#         ways = track_data[0].split(';;')
#         if re.match(num_format, ways[0]) and int(ways[0]) < 0:
#             ans = await mess_handler(-int(ways[0]), session)
#             req = send_text(id, str(ans['text']), ans['track'], ans['keys'])
#         elif viber['message']['type'] == 'text':
#             if viber['message']['text'] in ways:
#                 ans = await mess_handler(int(viber['message']['text']), session)
#                 send_text(id, str(ans['text']), ans['track'], ans['keys'])
#             else:
#                 err = send_text(id, 'Error')
#                 ans = await mess_handler(int(track_data[1]), session)
#                 send_text(id, str(ans['text']), ans['track'], ans['keys'])
#         else:
#             err = send_text(id, 'Error')
#             ans = await mess_handler(int(track_data[1]), session)
#             send_text(id, str(ans['text']), ans['track'], ans['keys'])

# async def mess_handler(id, session):
#     mess = await db_utility.get_message_by_id(session, id)
#     keys = await db_utility.get_keys_by_message(session, mess.id)
#     track = []
#     keyboard = {}
#     for key in keys:
#         track.append(key.end)
#         if key.num < 0:
#             track[0] = - track[0]
#             return {'text': mess.text, 'track': str(track)+ f'\n{id}', 'keys': None}
#         keyboard[key.text] = key.end
#     return {'text': mess.text, 'track': ';;'.join(list(map(str, track))) + f'\n{id}', 'keys': create_keyboard(keyboard)}
