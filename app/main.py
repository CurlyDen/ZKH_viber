from fastapi import FastAPI, Request, Depends, APIRouter
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
import sqlalchemy
from sending import *
from models import *
from db import *
import db_utility, settings
import typer, re
from sethook import sethook
from fastapi.openapi.utils import get_openapi

num_format = re.compile("^[\-]?[1-9][0-9]*\.?[0-9]+$")

app = FastAPI(docs_url="/mc_viber/docs", redoc_url="/mc_viber/redoc")

app.mount("/mc_viber/static/", StaticFiles(directory="static"), name='static')
templates = Jinja2Templates(directory="templates")

# print(async_session)
# @app.on_event("startup")
# async def startup_event():
#     print(sethook())
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.drop_all)
#         await conn.run_sync(Base.metadata.create_all)

# @app.get("/mc_viber")
# def hello():
#     return {"message": "OK"}

@app.get("/mc_viber/messages/{id}", response_model=list[MessageModel])
async def get_messages(request: Request, id: int, session: AsyncSession = Depends(get_session)):
    messages = await db_utility.get_messages(session, id)
    return [MessageModel(num=m.num, scenario=m.scenario, text=m.text, func=m.func, coords=m.coords) for m in messages]

@app.get("/mc_viber/links/{id}", response_model=list[KeyModel])
async def get_messages(request: Request, id: int, session: AsyncSession = Depends(get_session)):
    keys = await db_utility.get_keys(session, id)
    return [KeyModel(num=k.num, scenario=k.scenario, text=k.text, start=k.start, end=k.end) for k in keys]

@app.get("/mc_viber/canvas", response_model=list[ScenarioModel])
async def get_scenarios(session: AsyncSession = Depends(get_session)):
    scenarios = await db_utility.get_scenarios(session)
    return [ScenarioModel(title=s.title) for s in scenarios]

@app.post("/mc_viber/canvas")
async def add_scenario(scenario: ScenarioModel, session: AsyncSession = Depends(get_session)):
    scenario = await db_utility.add_scenario(session, scenario.title)
    try:
        await session.commit()
        return scenario
    except IntegrityError as ex:
        await session.rollback()
        raise HTTPException("The scenario is already stored")

@app.get("/mc_viber/canvas/{id}", response_class=HTMLResponse)
async def read_scenario(request: Request, id: int, session: AsyncSession = Depends(get_session)):
    scenario = await db_utility.get_scenario(session, id)
    messages = await db_utility.get_messages(session, id)
    keys = await db_utility.get_keys(session, id)
    data = {'blocks': {}, 'links': {}}
    id_to_num = {}
    for mes in messages:
        if mes.func: func = mes.func
        else: func = "/None"
        data["blocks"][int(mes.num)] = {"text": mes.text, "coords": mes.coords, "func": func}
        id_to_num[mes.id] = mes.num
    for link in keys:
        if link.text: text = link.text
        else: text = "/None"
        data["links"][int(link.num)] = {"text": text, "start": id_to_num[link.start], "end": id_to_num[link.end]}
    return templates.TemplateResponse("editor.html", {"request": request, "id": id, "title": scenario.title, "data": json.dumps(data)})

@app.post("/mc_viber/canvas/{id}")
async def save_scenario(request: Request, status_code=200, session: AsyncSession = Depends(get_session)):
    data = await request.json()
    sc_id = int(data['scenario'])
    await db_utility.delete_messages_of_scenario(session, sc_id)
    await db_utility.delete_keys_of_scenario(session, sc_id)
    await session.commit()
    num_to_id = {}
    for block_id in data['blocks']:
        mess = await db_utility.add_message(session, int(block_id), sc_id, data['blocks'][block_id]['text'], data['blocks'][block_id]['func'], json.dumps(data['blocks'][block_id]['coords']))
        await session.commit()
        print(mess.id)
        num_to_id[int(block_id)] = mess.id
    print(num_to_id)
    for link_id in data['links']:
        start = num_to_id[int(data['links'][link_id]['start'])]
        end = num_to_id[int(data['links'][link_id]['end'])]
        await db_utility.add_key(session, link_id, sc_id, data['links'][link_id]['text'], start, end)
    try:
        await session.commit()
        return 'ok'
    except IntegrityError as ex:
        print(ex)
        await session.rollback()
        raise HTTPException("Dublicate")

# @app.post("/mc_viber/webhook_viber")
# async def viber_bot(request: Request, status_code=200, session: AsyncSession = Depends(get_session)):
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

# async def conversation(viber, session):
#     try:
#         id = viber['user']['id']
#         # lng = viber['user']['language']
#     except:
#         id = viber['sender']['id']
#         # lng = viber['sender']['language']
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
#         if re.match(num_format,ways[0]) and int(ways[0]) < 0:
#             ans = await mess_handler(-int(ways[0]), session)
#             req = send_text(id, str(ans['text']), ans['track'], ans['keys'])
#         elif viber['message']['type'] == 'text':
#             if viber['message']['text'] in ways:
#                 ans = await mess_handler(int(viber['message']['text']), session)
#                 send_text(id, str(ans['text']), ans['track'], ans['keys'])
#             else:  # Некоректный ввод
#                 err = send_text(id, 'Error')
#                 ans = await mess_handler(int(track_data[1]), session)
#                 send_text(id, str(ans['text']), ans['track'], ans['keys'])
#         else:  # Некоректный ввод
#                 err = send_text(id, 'Error')
#                 ans = await mess_handler(int(track_data[1]), session)
#                 send_text(id, str(ans['text']), ans['track'], ans['keys'])