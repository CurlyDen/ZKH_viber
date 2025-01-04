from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.ext.asyncio import AsyncSession

import re, json

from models import MessageModel, KeyModel, ScenarioModel
from db import get_session, AsyncSession, engine, Base
import db_utility, settings
from sending import *
from sethook import sethook




num_format = re.compile("^[\-]?[1-9][0-9]*\.?[0-9]+$")

app = FastAPI(openapi_url="/api_mc/openapi.json", docs_url="/api_mc/docs", redoc_url="/api_mc/redoc")

functions = ['Отобразить', 'Сохранить', 'Кнопки по ссылке', 'Файл', "Контакт", "Ссылка", "Изображение", "Сравнить", "Обработать ссылку", "Меню"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # замените "*" на список разрешенных доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print(sethook())
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

@app.get("/api_mc/messages/{id}", response_model=list[MessageModel])
async def get_messages(id: int, status_code=200, session: AsyncSession = Depends(get_session)):
    messages = await db_utility.get_messages(session, id)
    return [MessageModel(unique_id=m.unique_id, id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

@app.get("/api_mc/links/{id}", response_model=list[KeyModel])
async def get_links(id: int, status_code=200, session: AsyncSession = Depends(get_session)):
    keys = await db_utility.get_keys(session, id)
    return [KeyModel(unique_id=k.unique_id, id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

@app.get("/api_mc/canvas", response_model=list[ScenarioModel])
async def get_scenarios(status_code=200, session: AsyncSession = Depends(get_session)):
    scenarios = await db_utility.get_scenarios(session)

    data = []
    for s in scenarios:
        messages = await db_utility.get_messages(session, s.id)
        blocks = [MessageModel(unique_id=m.unique_id, id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

        keys = await db_utility.get_keys(session, s.id)
        links = [KeyModel(unique_id=k.unique_id, id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

        data.append(ScenarioModel(title=s.title, id=s.id, blocks=blocks, links=links, functions=functions))

    return data



@app.post("/api_mc/canvas")
async def add_scenario(scenario: ScenarioModel, status_code=200, session: AsyncSession = Depends(get_session)): 
    scenario_db = await db_utility.add_scenario(session, scenario, functions)
    await session.commit()
    for block in scenario.blocks:        
        await db_utility.add_message(session, block["id"], scenario.id, block["title"], block["text"], block["coords"], block["style"], block["type"], block["parent_id"])
    for link in scenario.links:
        await db_utility.add_key(session, link["id"], link["scenario_id"], link['text'], link["start"], link["end"], link["type"])
    # await db_utility.add_message(session, scenario.blocks[1]["id"], scenario.id, scenario.blocks[1]["title"], scenario.blocks[1]["text"], scenario.blocks[1]["coords"], scenario.blocks[1]["style"], scenario.blocks[1]["type"], scenario.blocks[1]["parent_id"])

    await session.commit()
    return scenario_db

@app.delete("/api_mc/canvas")
async def del_scenario(id: int, status_code=200, session: AsyncSession = Depends(get_session)):
    res = await db_utility.delete_scenario(session, id)
    await session.commit()
    return res


@app.put("/api_mc/canvas")
async def upd_scenario(scenario: ScenarioModel, status_code=200, session: AsyncSession = Depends(get_session)): 
            
    await db_utility.update_scenario(session, scenario.id, scenario.title, scenario.functions)

    await session.commit()
    return scenario 
        

@app.get("/api_mc/canvas/{id}", response_model=ScenarioModel)
async def read_scenario(request: Request, id: int, status_code=200, session: AsyncSession = Depends(get_session)):
    scenario = await db_utility.get_scenario(session, id)
    
    messages = await db_utility.get_messages(session, scenario.id)
    blocks = [MessageModel(unique_id=m.unique_id, id=m.id, scenario_id=m.scenario_id, text=m.text, title=m.title, coords=m.coords, style=m.style, type=m.type, parent_id=m.parent_id) for m in messages]

    keys = await db_utility.get_keys(session, scenario.id)
    links = [KeyModel(unique_id=k.unique_id, id=k.id, scenario_id=k.scenario_id, text=k.text, start=k.start, end=k.end, type=k.type) for k in keys]

    return ScenarioModel(title=scenario.title, id=scenario.id, blocks=blocks, links=links, functions=functions)

@app.post("/api_mc/canvas/{id}")
async def save_scenario(request: Request, status_code=200, session: AsyncSession = Depends(get_session)):
    scenario = await request.json()
    
    await db_utility.delete_messages_of_scenario(session, scenario["id"])
    await db_utility.delete_keys_of_scenario(session, scenario["id"])
    
    await session.commit()

    for m in scenario["blocks"]:
        await db_utility.add_message(
            session,
            id=m.get("id"),
            scenario_id=m.get("scenario_id"),
            text=m.get("text"),
            title=m.get("title"), 
            coords=m.get("coords"),
            style=m.get("style"),
            type=m.get("type"),
            parent_id=m.get("parent_id"),
        )
        await session.commit()

    # Add new keys
    for l in scenario["links"]:
        await db_utility.add_key(
            session,
            id=l.get("id"),
            scenario_id=l.get("scenario_id"),
            text=l.get("text"),
            start=l.get("start"),
            end=l.get("end"),
            type=l.get("type"),
        )
        await session.commit()
    return

@app.post("/api_mc/webhook_viber/{scenario}")
async def viber_bot(scenario: int, request: Request, status_code=200, session: AsyncSession = Depends(get_session)):
    viber = await request.json()
    viber["scenario"] = scenario
    print(viber, type(viber))
    if viber['event'] == 'failed':
        return JSONResponse(content={"message": viber}, status_code=500)
    elif viber['event'] == 'unsubscribed':
        print('Отписка', viber)
    elif viber['event'] == 'conversation_started':
        print('Начнём', viber)
        await conversation(viber, session)
    elif viber['event'] == 'message':
        await message(viber, session)
    elif viber['event'] == 'trigger':
        await trigger(viber, session)
    else:
        print(viber['event'])
    return {"message": "OK"}


async def trigger(viber, session):
    print('trigger', viber)
    if 'error' in viber:
       mess = send_text(settings.ME[viber['scenario']], viber['error'], '__', create_keyboard({'Окей':'//menu//'}), scenario=viber["scenario"])
       print(mess)
       return
    try:
        user = await db_utility.get_user_by_fid(session, viber['fid'], viber["scenario"])
        mess = send_text(user.id.split('#')[0], viber['text'], '__', create_keyboard({'Окей':'//menu//'}), scenario=viber["scenario"])
    except Exception as e: viber['text'] += f'\n{e}' 
    # mess = send_text('2DpjTnaEgk4u74P73jxd2A==', viber['text'], '__', create_keyboard({'Окей':'//menu//'}), scenario=viber["scenario"])
    return


async def mess_handler(id, session, user, scenario, trackdata='__'):
    mess = await db_utility.get_message_by_id(session, str(id) + '#' + str(scenario))
    buttons = {but.id: but for but in await db_utility.get_buttons(session, scenario, mess.id)}
    keys = await db_utility.get_keys_by_start_message(session, scenario, int(mess.id))
    if len(keys) == 0:
        menu = await db_utility.get_menu_message(session, scenario)
        if menu is None:
            link = await db_utility.get_keys_by_start_message(session, scenario, '-1')
            await mess_handler(link[0].end, session, user, scenario)
            return
        await mess_handler(menu.id, session, id, scenario)
        return 
    while 'tree' not in keys[0].id:
        func = mess.title
        if '{fid}' in mess.text:
            user_db = await db_utility.get_user(session, user + f'#{scenario}')
            if not user_db:
                mess.text = mess.text.replace('{fid}', 'None')
            else:
                mess.text = mess.text.replace('{fid}', user_db.foreign_id)
        mess_text = mess.text
        track = trackdata.split('##')
        print(0, mess_text.split('###\n'), keys, buttons, track)
        text = mess_text.split('###\n')[0]
        if '{track}' in text:
            text = text.replace('{track}', track.pop())
        try: 
            meta = json.loads('{' + ', '.join([f'"{i.split(": ")[0]}": "{i.split(": ")[1]}"' for i in mess_text.split('###\n')[1].format(*track[::-1]).split('\n')]) + '}')
            track = track[:-mess_text.split('###\n')[1].count('{}')]
            trackdata = '##'.join(track)
        except Exception as e: 
            print(e, type(e))
            meta = None
        print(meta)
        if type(meta) is dict:
            if'clear' in meta and meta['clear'] == '1':
                trackdata = '__'
            # if 'pop' in meta and meta['pop'] == '1':
            #     trackdata = '##'.join(track[:-1])
        keyboard = None
        # if func == 'Сравнить': trackdata = trackdata[:track.rindex('##')]
        # if func != 'Сохранить': trackdata = trackdata[:track.rindex('##')]
        if func == 'Кнопки по ссылке':
            try:
                res = await get_req(session, meta['link'], 'get')
                print(res)
                if res['status'] and res['type'] == 'btns':
                    keyboard = res['buttons']
                if 'track' in res:
                    trackdata += "##" + "##".join(res['track'])
                if 'text' in res:
                    text = text.replace('{text}', res['text'])
                ans = send_text(user, text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
                return
            except Exception as e: print(e)
        elif func == 'Обработать ссылку':
            if 'media' in meta:
                res = await get_req(session, meta['link'], 'post', meta['media'])
            else:
                res = await get_req(session, meta['link'])
            print(res)
            if res['type'] == 'login':
                user_db = await db_utility.upd_user(session, user + f'#{scenario}', res['uid'])
                await session.commit()
            if res['status'] == 1 or res['type'] == 'show':
                if 'track' in res:
                    trackdata += "##" + "##".join(res['track'])
                if 'text' in res:
                    text = text.replace('{text}', res['text'])
                ans = send_text(user, text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
                if res['type'] != 'show':
                    return
            else:
                ans = send_text(user, text, f'{id}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        elif func == 'Файл': ans = send_file(user, meta['file'], meta['name'], 5120000, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        elif func == 'Контакт': ans = send_contact(user, text.split('\n')[0], text.split('\n')[1], f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        elif func == 'Ссылка': ans = send_url(user, text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        elif func == 'Изображение': ans = send_image(user, meta['link'], text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        else: ans = send_text(user, text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
        if func == 'Сохранить': return
        # else: trackdata = "__"
        mess = await db_utility.get_message_by_id(session, str(keys[0].end) + '#' + str(scenario))
        buttons = {but.id: but for but in await db_utility.get_buttons(session, scenario, mess.id)}
        keys = await db_utility.get_keys_by_start_message(session, scenario, int(mess.id))
    else:
        if '{fid}' in mess.text:
            user_db = await db_utility.get_user(session, user + f'#{scenario}')
            if not user_db:
                mess.text = mess.text.replace('{fid}', 'None')
            else:
                mess.text = mess.text.replace('{fid}', user_db.foreign_id)
        mess_text = mess.text
        text = mess_text.split('###\n')[0]
        track = trackdata.split('##')
        print(track, 0)
        if '{track}' in text:
            text = text.replace('{track}', track.pop())
        try: 
            meta = json.loads('{' + ', '.join([f'"{i.split(": ")[0]}": "{i.split(": ")[1]}"' for i in mess_text.split('###\n')[1].format(*track[::-1]).split('\n')]) + '}')
            print(track, 1)
            track = track[:-mess_text.split('###\n')[1].count('{}')]
            trackdata = '##'.join(track)
        except Exception as e: 
            print(e)
            meta = None
        if type(meta) is dict: 
            if 'clear' in meta and meta['clear'] == '1':
                trackdata = '__'
        func = mess.title
        # if func == 'Сравнить': trackdata = trackdata[:trackdata.rindex('##')]
        # elif func != 'Сохранить': trackdata = '__'
        print(1, mess.text, keys, buttons, trackdata, meta)
        track = []
        keyboard = {}
        if func == 'Сравнить':
            data = trackdata.split('##')
            if data.pop() != data.pop():
                keys = list(filter(lambda x: x.start[-7:] != '-tree-1', keys))
                text.format('Несовпадение')
            else:
                text.format('Совпадение')
            trackdata += '##' + '##'.join(data)
        elif func == 'Файл': 
            print(text, meta)
            for key in keys:
                track.append(key.end)
                keyboard[buttons[key.start].text] = key.end + '~~' + key.start
            ans = send_file(user, meta['file'], meta['name'], 5120000, ' '.join(track) + f'\n{id}\n{trackdata}', create_keyboard(keyboard), scenario=scenario)
            print(ans.json())
            return
        elif func == 'Обработать ссылку':
            if 'media' in meta:
                res = await get_req(session, meta['link'], 'post', meta['media'])
            else:
                res = await get_req(session, meta['link'])
            print(res, text)
            if 'track' in res:
                    trackdata += "##" + "##".join(res['track'])
            if 'text' in res:
                    text = text.replace('{text}', res['text'])
            if res['type'] == 'login':
                user_db = await db_utility.upd_user(session, user + f'#{scenario}', res['uid'])
                await session.commit()
            if res['status'] == 0:
                keys = list(filter(lambda x: x.start[-7:] != '-tree-1', keys))
            else:
                await mess_handler(list(filter(lambda x: x.start[-7:] == '-tree-1', keys))[0].end, session, user, scenario, trackdata)
                return
        elif func == 'Кнопки по ссылке': 
            try:
                res = await get_req(session, meta['link'], 'get')
                print(res, text)
                if res['status']:
                    keyboard = res['buttons']
                if 'track' in res:
                    trackdata += "##" + "##".join(res['track'])
                if 'text' in res:
                    text = text.replace('{text}', res['text'])
                for key in keys:
                    track.append(key.end)
                    keyboard[buttons[key.start].text] = key.end + '~~' + key.start
                ans = send_text(user, text, f'{keys[0].end}\n{id}\n{trackdata}', keyboard, scenario=scenario)
                return
            except: pass
        for key in keys:
            track.append(key.end)
            keyboard[buttons[key.start].text] = key.end + '~~' + key.start
        if func == 'Изображение': ans = send_image(user, meta['link'], text, ' '.join(track) + f'\n{id}\n{trackdata}', create_keyboard(keyboard), scenario=scenario)
        else: ans = send_text(user, text, ' '.join(track) + f'\n{id}\n{trackdata}', create_keyboard(keyboard), scenario=scenario)
        print(ans.text)
    return


async def conversation(viber, session):
    try:
        id = viber['user']['id']
        # lng = viber['user']['language']
    except:
        id = viber['sender']['id']
        # lng = viber['sender']['language']
    link = await db_utility.get_keys_by_start_message(session, viber["scenario"], '-1')
    user = await db_utility.get_user(session, id + f'#{viber["scenario"]}')
    print(user)
    if not user:
        await db_utility.add_user(session, id, viber["scenario"], 'None')
    else:
        user.foreign_id = 'None'
    await session.commit()
    await mess_handler(link[0].end, session, id, viber["scenario"])
    return

async def message(viber, session):
    print(viber)
    if 'tracking_data' not in viber['message']:
        await conversation(viber, session)
    else:
        id = viber['sender']['id']
        track_data = viber['message']['tracking_data'].split('\n')
        ways = track_data[0].split(' ')
        if viber['message']['type'] == 'text':
            if viber['message']['text'] == '//menu//':
                menu = await db_utility.get_menu_message(session, viber["scenario"])
                await mess_handler(menu.id, session, id, viber["scenario"])
                return
            way_from = viber['message']['text'].split('~~')
            if len(way_from) == 1:
                if not ways[0].isdigit():
                    menu = await db_utility.get_menu_message(session, viber["scenario"])
                    if menu is None:
                        conversation(viber, session)
                        return
                    await mess_handler(menu.id, session, id, viber["scenario"])
                    return
                await mess_handler(int(ways[0]), session, id, viber["scenario"], track_data[2] + '##' + viber['message']['text'])
            elif way_from[0] in ways:
                start = await db_utility.get_message_by_id(session, way_from[1] + f'#{viber["scenario"]}')
                if start is None:
                    menu = await db_utility.get_menu_message(session, viber["scenario"])
                    if menu is None:
                        conversation(viber, session)
                        return
                    await mess_handler(menu.id, session, id, viber["scenario"])
                    return
                await mess_handler(int(viber['message']['text'].split('~~')[0]), session, id, viber["scenario"], track_data[2] + '##' + start.text)
        elif viber['message']['type'] == 'picture':
            await mess_handler(int(ways[0]), session, id, viber["scenario"], track_data[2] + '##' + requests.get(viber['message']['media']).content.hex())
    return

async def get_req(session, link, type='get', media=b''):
    print(link)
    if type == 'get':
        res = requests.get('https://' + link)
        return res.json()
    elif type == 'post':
        res = requests.post('https://' + link, data={'image':media})
        print(res)
        data = res.json()
        return data
    return True

