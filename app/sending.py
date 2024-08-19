import requests, json
import settings


url = 'https://chatapi.viber.com/pa/send_message'

# ДЕКОРАТОР ДЛЯ функций и отправки
def sending(func):
    def wrapped(*args, **kwargs):
        scenario = kwargs.pop('scenario', None)
        auth_token = settings.VIBER_SCENARIO[scenario]
        headers = {'X-Viber-Auth-Token': auth_token}
        return requests.post(url, json.dumps(func(*args, scenario=scenario)), headers=headers)
    return wrapped

@sending  # Отправить текст
def send_text(agent, text, track=None, keys=None, scenario=None):
    m = dict(receiver=agent, min_api_version=2, tracking_data=track, type="text", text=text, keyboard=keys)
    return m

@sending  # Отправить картинку
def send_image(agent, path, text='', track=None, keys=None, scenario=None):
    m = dict(receiver=agent, min_api_version=1, tracking_data=track, type="picture", text=text, media=path, keyboard=keys, thumbnail=path)
    return m

@sending  # Отправить файл
def send_file(agent, media, name, size=5120000, track=None, keys=None, scenario=None):
    m = dict(receiver=agent, min_api_version=1, tracking_data=track, type="file", media=media, file_name=name, size=size, keyboard=keys)
    return m

@sending  # Отправить url
def send_url(agent, media, track=None, keys=None, scenario=None):
    m = dict(receiver=agent, min_api_version=2, tracking_data=track, type="url", media=media, keyboard=keys)
    return m

@sending  # Отправить контакт
def send_contact(agent, name, phone, track=None, keys=None, scenario=None):
    m = dict(receiver=agent, min_api_version=2, tracking_data=track, type="contact", contact={'name':name, 'phone_number':phone}, keyboard=keys)
    return m

def create_keyboard(args):
    keyboard = {
        "Type":"keyboard",
        "Buttons":[]
        }
    for arg in args:
        if type(args) == dict: action = args[arg]
        else: action = arg
        button = {
            "ActionType":"reply",
            "ActionBody":action,
            "Text":f'<font size=”32” color="#ffffff"><b>{arg}</b></font>',
            "TextSize":"large",
            "Frame.BorderWidth":5,
            "Frame.BorderColor": '#2327eb',
            "BgColor": "#7960ee",
            "TextVAlign": "middle",
			"TextHAlign": "center",
            }
        if arg == 'Отмена':
            button["BgColor"] = "#dd8157"
        keyboard['Buttons'].append(button)
    return keyboard
