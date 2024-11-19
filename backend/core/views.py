
from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from ninja import NinjaAPI

from core.models import Chat, Message

HEADER_CORS = 'Access-Control-Allow-Origin'

api = NinjaAPI(
    openapi_extra = {
        'info': {
            'termsOfService': 'https://github.com/t3rcio/chatterbox'
        }
    },
    title = 'Chatterbox API',
    description = 'Chatterbox API'
)

def valid_payload(post:dict) -> bool:
    return ('username' in post) and ('email' in post)

@api.post('chat/new')
def new_chat(request):
    '''
    Creates a new chat
    Return JsonResponse
    '''
    chat = Chat.objects.create()
    response = JsonResponse(chat.to_dict(), safe=False)
    response[HEADER] = settings.ALLOWED_CORS_SERVERS
    return response

@api.get('chat/list')
def list_chats(request):
    '''
    Returns a chat list
    '''
    chats = list(Chat.objects.to_dict())
    response = JsonResponse(chats, safe=False)
    response[HEADER] = settings.ALLOWED_CORS_SERVERS
    return response    

@api.get('chat/{id}')
def get_chat(request, id:str) -> JsonResponse:
    try:
        chat = Chat.objects.get(id=id)
        response = chat.to_dict()
    except:
        response = {}
    response = JsonResponse(response, safe=False)
    response[HEADER] = settings.ALLOWED_CORS_SERVERS
    return response


@api.get('messages/list')
def messages_list(request):
    messages = list(Message.objects.to_dict())

@api.post('users/new')
def new_user(request):
    '''
    Cadastra novo usuario caso nao exista
    '''
    if not valid_payload(request.POST):
        return JsonResponse({})
    
    _response = {}
    try:
        usuario = User.objects.get(username=request.POST.get('username'))
        if usuario:
            _response = {
                'error': 'Usuario ja existe'
            }
    except:
        new_user = User.objects.create(
            username=request.POST.get('username'),
            email=request.POST.get('email')
        )
        _response = {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }


    response = JsonResponse(
        _response,
        safe=False
    )
    response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return response

@api.get('user/{username}')
def get_user(request, username):
    user = {}
    try:
        _user = User.objects.get(username=username)        
        user = {
            "id": _user.id,
            "username": _user.username,
            "email": _user.email
        }    
    except User.DoesNotExist:
        user = {}
    except Exception as error:
        logging.error(str(error))        
        user = {}    
    
    response = JsonResponse(user, safe=False)
    response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return response

