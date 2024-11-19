from tornado.web import url
from wsserver.handlers import MainHandler

route_table = [
    url(
        r'/chat/(?P<id>[a-zA-Z0-9\-]*)',
        MainHandler,
        name="main-handler"
    ),
]