from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from uuid import uuid4

import json

class BasicManager(models.Manager):
    def to_dict(self):
        return [
            c.to_dict()
            for c in self.all()
        ]        

class ChatManager(BasicManager):
    def to_dict(self):
        return super().to_dict()

class Chat(models.Model):
    '''
    The Chat model
    '''
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    timestamp = models.FloatField(default=timezone.now().timestamp())
    objects = ChatManager()
    user = models.ForeignKey(User, related_name='chats', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        return "Chat"
    
    def __repr__(self):
        return "Chat <{}>".format(self.id)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.id,
            'timestamp': self.timestamp
        }
        

class Message(models.Model):
    '''
    The Message model
    '''
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(default='')
    file = models.FileField(upload_to='media/uploads', max_length=512, blank=True, null=True)
    timestamp = models.FloatField(default=timezone.now().timestamp())
        

    def __str__(self):
        return 'Message:{}'.format(self.text)
    
    def __repr__(self):
        return 'Message <{}>'.format(self.id)
    
    def blob(self):
        return ''
    
    def to_dict(self):
        return {
            'id': self.id,
            'chat': {
                'id': self.chat.id,
            },
            'text': self.text,
            'blob': self.blob,
            'user': {
                'id': self.user.id
            },
            'timestamp': self.timestamp
        }
        
    
    class Meta:
        abstract = True
        ordering = ['-timestamp']
