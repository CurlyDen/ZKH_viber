#sethook
import pip._vendor.requests as requests
import json
import settings

hook = 'https://chatapi.viber.com/pa/set_webhook'

def sethook():
    jsons = {}
    for scenario in settings.VIBER_SCENARIO:
       auth_token = settings.VIBER_SCENARIO[scenario]
       headers = {'X-Viber-Auth-Token': auth_token}
       sen = dict(url=f'https://{settings.URL}/webhook_viber/{scenario}',
              event_types = ['unsubscribed', 'conversation_started', 'message', 'seen', 'delivered', 'subscribed'])
       # sen - это body запроса для отправки к backend серверов viber
       #seen, delivered - можно убрать, но иногда маркетологи хотят знать,
       #сколько и кто именно  принял и почитал ваших сообщений,  можете оставить)
       r = requests.post(hook, json.dumps(sen), headers=headers)
       print(scenario, r.json())
    # r - это пост запрос составленный по требованиям viber 
    # в ответном print мы должны увидеть "status_message":"ok" - и это значит,
    #  что вебхук установлен

sethook()