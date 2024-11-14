
from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse

from ninja import NinjaAPI

from core.models import Chat, Message

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
    return JsonResponse(chat.to_dict(), safe=False)

@api.get('chat/list')
def list_chats(request):
    '''
    Returns a chat list
    '''
    chats = list(Chat.objects.to_dict())
    return JsonResponse(chats, safe=False)

@api.get('chat/{id}')
def get_chat(request, id:str) -> JsonResponse:
    try:
        chat = Chat.objects.get(id=id)
        response = chat.to_dict()
    except:
        response = {}
    return JsonResponse(response, safe=False)


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
    new_user = {}
    try:
        usuario = User.objects.get(username=request.POST.get('username'))
        if usuario:
            return JsonResponse({
                'error': 'Usuario ja existe'
            })
    except:
        new_user = User.objects.create(
            username=request.POST.get('username'),
            email=request.POST.get('email')
        )


    return JsonResponse(
        {
            'id': new_user.id,
            'username': new_user.username,
            'e-mail': new_user.email
        }, 
        safe=False)
    