'''
 S3 utilities
'''

from django.conf import settings

import boto3
import logging

logging.basicConfig(
    filename = settings.LOG_FILENAME
)

EXPIRE_TIME = 3600 # seconds

S3 = 's3'
S3_PUT_OPERATION = 'put_object'
S3_GET_OPERATION = 'get_object'
S3_CLIENT = boto3.client(
    S3,
    aws_access_key_id=settings.S3.get('ACCESS_KEY'),
    aws_secret_access_key=settings.S3.get('SECRET_ACCESS_KEY'),
    region_name=settings.S3.get('REGION')    
)

def get_upload_presigned_url(filename, _type='text/plain'):
    url = ''
    try:
        url = S3_CLIENT.generate_presigned_post(            
            settings.S3.get('BUCKET_NAME'),
            filename,
            Fields={},
            Conditions=[],
            ExpiresIn=EXPIRE_TIME
        )
    except Exception as _error:
        logging.error(_error)
    
    return url

def get_download_presigend_url(object_name):
    url = ''
    try:
        url = S3_CLIENT.generate_presigned_url(
            S3_GET_OPERATION,
            Params = {
                "Bucket": settings.S3.get('BUCKET_NAME'),
                "Key": object_name
            }
        )
    except Exception as _error:
        logging.error(_error)
    
    return url
