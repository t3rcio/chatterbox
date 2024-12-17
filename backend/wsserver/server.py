

import asyncio
import django
import os
import ssl 
import sys
import tornado
import tornado.ioloop
import tornado.web

from optparse import OptionParser
from pathlib import Path

DEFAULT_PORT=8000
PRODUCTION_PATH = '/code'
PROJECTS_PATH = '/Projetos'
DEVELOPMENT_PATH = str(Path.home()) + PROJECTS_PATH + '/chatterbox/backend'

parser = OptionParser()
parser.add_option(
    '-p',
    '--port',
    dest='port',
    help='Port to listen',
    default=DEFAULT_PORT
)

sys.path.insert(0, PRODUCTION_PATH)

__ENV__ = os.environ.get('ENVIRONMENT', '')
if not __ENV__:
    sys.path.insert(0, DEVELOPMENT_PATH)
    sys.path.insert(1, DEVELOPMENT_PATH + '/chatterbox')

os.environ['DJANGO_SETTINGS_MODULE'] = 'chatterbox.settings'

django.setup()

from django.conf import settings
from wsserver import urls, settings as wsserver_settings

async def main(port=8000):
    app = tornado.web.Application(urls.route_table, debug=settings.DEBUG)
    http_server = tornado.httpserver.HTTPServer(app)
    
    config_dict = getattr(wsserver_settings, "SSL", {})
    if config_dict:
        ssl_options = dict(certfile=config_dict.get("certfile"), keyfile=config_dict.get("keyfile"))
        http_server = tornado.httpserver.HTTPServer(app, ssl_options=ssl_options)
    
    if settings.DEBUG:
        print("Server running... listening " + str(port))
    
    http_server.listen(port)
    await asyncio.Event().wait()

if __name__ == '__main__':
    options, args = parser.parse_args()    
    asyncio.run(main(options.port))
    
