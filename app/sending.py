import requests, json
import settings


auth_token = settings.VIBER_TOKEN
url = 'https://chatapi.viber.com/pa/send_message'
headers = {'X-Viber-Auth-Token': auth_token}

# ДЕКОРАТОР ДЛЯ функций и отправки
def sending(func):
    def wrapped(*args):
        return requests.post(url, json.dumps(func(*args)), headers=headers)
    return wrapped

@sending  # Отправить текст
def send_text(agent, text, track=None, keys=None):
    m = dict(receiver=agent, min_api_version=2, tracking_data=track, type="text", text=text, keyboard=keys)
    return m

@sending  # Отправить контакт
def send_contact(agent, name, phone, track=None, keys=None):
    m = dict(receiver=agent, min_api_version=2, tracking_data=track, type="contact", contact={'name':name, 'phone_number':phone}, keyboard=keys)
    return m

def create_keyboard(*args):
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
            "Text":f'<font size=”32”><b>{arg}</b></font>',
            "TextSize":"large",
            "Frame.BorderWidth":5,
            "Frame.BorderColor": '#2327eb',
            }
        keyboard['Buttons'].append(button)
    return keyboard
