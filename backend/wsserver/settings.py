# Settings

import logging
import os

from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve()
BACKEND_DIR = BASE_DIR.parent.parent
DEBUG = False
FORMAT_DATE = '%Y-%m-%d'

LOG_FILES_PATH = str(BACKEND_DIR) + '/_logs/'
LOG_FILENAME = LOG_FILES_PATH + datetime.now().strftime(FORMAT_DATE) + '.log'

SSL = {
    'certfile': os.path.join(BACKEND_DIR, 'certFile.pem'),
    'keyfile': os.path.join(BACKEND_DIR, 'privateKey.pem'),
}

if not DEBUG:
    SSL = {
        'certfile':'/etc/letsencrypt/live/chatterbox.app.br/fullchain.pem',
        'keyfile': '/etc/letsencrypt/live/chatterbox.app.br/privkey.pem',
    }

