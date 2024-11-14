
from django.shortcuts import render
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