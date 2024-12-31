
import logging

from django.shortcuts import render
from django.conf import settings
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse

from ninja import NinjaAPI

from core.models import Chat, Message, ChatUsers

HEADER_CORS = 'Access-Control-Allow-Origin'

logging.basicConfig(
    filename = settings.LOG_FILENAME
)

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
    response = {
        "error": "Nao foi possivel criar o chat"
    }
    try:
        if request.method == 'POST':
            user_id = request.POST.get('user_id', '')
            if user_id:            
                user = User.objects.get(pk=int(user_id))
                chat = Chat.objects.create(user=user)
                response = JsonResponse(chat.to_dict(), safe=False)
    except Exception as error:
        logging.error(str(error))    
        response = JsonResponse(response, safe=False)
    
    response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return response

@api.get('user/{user_id}/chats')
def list_chats(request, user_id):
    '''
    Returns a user's chat list
    '''
    chats = {}
    try:
        user = User.objects.get(pk=int(user_id))        
        chats_iniciados = [_c.to_dict() for _c in user.chats.all()]
        chats_convidados = [cr.chat.to_dict() for cr in user.chats_related.all()]
        chats = chats_iniciados + chats_convidados
        response = JsonResponse(chats, safe=False)
    
    except Exception as error:
        logging.error(str(error))
        response = JsonResponse({})
    
    response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return response    

@api.get('chat/{id}')
def get_chat(request, id:str) -> JsonResponse:
    try:
        chat = Chat.objects.get(id=id)
        response = chat.to_dict()
    except:
        response = {}
    response = JsonResponse(response, safe=False)
    response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
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

@api.get('/chat/access/{user}/{chat_id}')
def access_chat(request, user, chat_id):
    response = {}
    
    try:
        chat = Chat.objects.get(id=chat_id)
        user = User.objects.get(id=int(user))
        user_chat = ChatUsers.objects.filter(user=user).exists()
        if not user_chat:
            ChatUsers.objects.create(
                chat=chat,
                user=user
            )
        response = [{'id': u.id, 'username': u.username, 'email': u.email} for u in ChatUsers.users_list(chat)]
    except Exception as _error:
        logging.error(_error)
    
    _response = JsonResponse(response, safe=False)
    _response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return _response

@api.get('/chat/{chat_id}/users')
def access_chat(request, chat_id):
    response = {}
    
    try:
        chat = Chat.objects.get(id=chat_id)        
        response = [{'id': u.id, 'username': u.username, 'email': u.email} for u in ChatUsers.users_list(chat)]
    except Exception as _error:
        logging.error(_error)
    
    _response = JsonResponse(response, safe=False)
    _response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return _response

@api.delete('/chat/{user_id}/{chat_id}')
def remove_chat_user(request, user_id, chat_id):
    response = {}    
    
    try:
        chat = Chat.objects.get(id=chat_id)
        user = User.objects.get(id=int(user_id))
        user_chat = ChatUsers.objects.filter(user=user, chat=chat)
        if user_chat.exists():
            user_chat.delete()
        response = [{'id': u.id, 'username': u.username, 'email': u.email} for u in ChatUsers.users_list(chat)]        
    except Exception as _error:
        logging.error(_error)
    
    _response = JsonResponse(response, safe=False)
    _response[HEADER_CORS] = settings.ALLOWED_CORS_SERVERS
    return _response
