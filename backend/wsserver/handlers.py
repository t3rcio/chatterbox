
import aiosqlite
import json
import logging

from django.conf import settings
from tornado import websocket

from core.models import Message
from wsserver.settings import LOG_FILENAME

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
    database = await connect()
    cursor = await database.execute("SELECT * FROM core_chat WHERE id = '%s'" % (id,))
    result = await cursor.fetchone()
    await cursor.close()
    return result

class MainHandler(websocket.WebSocketHandler):

    connections = []

    async def check_origin(self, origin:str) -> bool:
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
        conn = [c 
            for c in self.connections 
            if c.chat_id == chat_id
        ]
        return conn[0] if len(conn) > 0 else []

    async def open(self, *args, **kwargs):
        chat_id = kwargs.get('id')
        chat = await get_chat(id=chat_id)
        if not chat:
            self.write('404 - Does not exist such chat') #TODO improve this 
            return
        
        setattr(self, 'chat_id', chat_id)
        MainHandler.connections.append(self)
    
    async def on_message(self, message, *args, **kwargs):
        _message = json.loads(message)
        try:
            conn = await self.route_message(_message)
            if conn:
                print(_message.get('text'), ' / ', conn.__dict__['chat_id'])
                conn.write_message(_message.get('text'))
        
        except Exception as error:
            logging.error(str(error))
    
    async def on_close(self):
        MainHandler.connections.pop(self)
        diff = str(len(MainHandler.connections))
        if settings.DEBUG:
            print("Connection close. Still " + diff  + " least")
        
        loggin.info('Connection closed. Still ' + diff)

