#sethook
import pip._vendor.requests as requests
import json
import settings

auth_token = settings.VIBER_TOKEN
hook = 'https://chatapi.viber.com/pa/set_webhook'
headers = {'X-Viber-Auth-Token': auth_token}

def sethook():
    sen = dict(url=f'https://{settings.URL}/webhook_viber',
           event_types = ['unsubscribed', 'conversation_started', 'message', 'seen', 'delivered', 'subscribed'])
    # sen - это body запроса для отправки к backend серверов viber
    #seen, delivered - можно убрать, но иногда маркетологи хотят знать,
    #сколько и кто именно  принял и почитал ваших сообщений,  можете оставить)
    r = requests.post(hook, json.dumps(sen), headers=headers)
    # r - это пост запрос составленный по требованиям viber 
    return r.json()
    # в ответном print мы должны увидеть "status_message":"ok" - и это значит,
    #  что вебхук установлен