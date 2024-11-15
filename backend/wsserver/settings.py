# Settings

import logging
import os

from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve()
BACKEND_DIR = BASE_DIR.parent.parent
FORMAT_DATE = '%Y-%m-%d'

LOG_FILES_PATH = str(BACKEND_DIR) + '/_logs/'
LOG_FILENAME = LOG_FILES_PATH + datetime.now().strftime(FORMAT_DATE) + '.log'

