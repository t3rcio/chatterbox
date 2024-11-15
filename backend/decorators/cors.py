
# CORS treatments
from django.conf import settings

def allowed_cors(view):
    def wrapper(*args, **kwargs):
        response = view(request)
        response['Access-Control-Allow-Origin'] = settings.ALLOWED_CORS_SERVERS
        return response
    return wrapper()
