
import aiosqlite
import json
import logging

from datetime import datetime
from uuid import uuid4
from django.conf import settings
from tornado import websocket

from core.models import Message
from wsserver.settings import LOG_FILENAME

HANDSHAKE = 'Chatterbox Client v.10'

'''
Ex. de Message em json
{
    "id": "23132465421321da3d1f3as2d1f3asd21fas", 
    "chat":{
        "id":"546876433454f6ad4f6a8sdf6a5ds4afs"
    }, 
    "text":"", 
    "blob":"", # nao usado pqto
    "user":{
        "id":2313213
    }, 
    "timestamp": 21354646851463589687 # em javascript Date.now()
}
'''

logging.basicConfig(
    filename=LOG_FILENAME
)

async def connect():
    '''
    (async) Conecta ao banco
    '''
    db = await aiosqlite.connect(settings.DATABASES.get('default', {}).get('NAME', ''))
    return db

async def get_chat(id:str) -> tuple:
    '''
    (async) Obtem a conversa pelo id    
    '''
    result = ()
    try:
        database = await connect()
        cursor = await database.execute("SELECT * FROM core_chat WHERE id = '%s'" % (id,))
        result = await cursor.fetchone()
        await cursor.close()
    except Exception as _error:
        logging.error(str(_error))
    
    return result

async def get_user(id:int) -> tuple:
    result = ()
    try:
        database = await connect()
        cursor = await database.execute("SELECT * FROM auth_user WHERE id = %s" % ( int(id),))
        result = await cursor.fetchone()
        await cursor.close()
    except Exception as _error:
        logging.error(str(_error))
    
    return result

class MainHandler(websocket.WebSocketHandler):

    connections = []

    def check_origin(self, origin:str) -> bool:
        '''
        Validates the origin
        # TODO
        '''
        return True
    
    async def route_message(self, message) -> list:
        '''
        Return the connection to delivery the message
        '''
        chat_id = message.get('chat').get('id')
        conns = [c 
            for c in self.connections 
            if c.chat_id == chat_id.replace('-','')
        ]
        return conns

    async def open(self, *args, **kwargs):
        chat_id = kwargs.get('id').replace('-', '')
        chat = await get_chat(id=chat_id)
        if not chat:
            return
        
        setattr(self, 'chat_id', chat_id)
        MainHandler.connections.append(self)
    
    async def on_message(self, message, *args, **kwargs):
        _message = json.loads(message)
        chat_id = _message.get('chat').get('id')
        user = await get_user(_message.get('user').get('id', '0'))
        payload = {
            'id': str(uuid4()),
            'chat': {
                'id': chat_id
            },
            'text': _message.get('text'),
            'blob': '',
            'user': {
                'id': user[0],
                'username': user[4]
            },
            'timestamp': datetime.now().timestamp()
        }
        try:
            conns = await self.route_message(_message)
            for conn in conns:
                conn.write_message(json.dumps(payload))
        
        except Exception as error:
            logging.error(str(error))
    
    def on_close(self):
        _index = MainHandler.connections.index(self)
        MainHandler.connections.pop(_index)
        diff = str(len(MainHandler.connections))
        if settings.DEBUG:
            print("Connection close. Remaining " + diff)
        logging.info('Connection closed. Remaining ' + diff)

