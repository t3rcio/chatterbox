from django.test import TestCase
from django.conf import settings

import os
import boto3
import requests

from s3.utils import get_upload_presigned_url
class TestS3Upload(TestCase):

    s3_client = {}

    def setUp(self):
        TestS3Upload.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.S3.get('ACCESS_KEY'),
            aws_secret_access_key=settings.S3.get('SECRET_ACCESS_KEY'),
            region_name=settings.S3.get('REGION')
        )
    
    def test_generate_url(self):
        url = TestS3Upload.s3_client.generate_presigned_url(
            "put_object",
            Params = {
                "Bucket": settings.S3.get('BUCKET_NAME'),
                "Key": 'some-key-file',
                "ContentType": "",
                "ACL": 'public_read'
            },
            ExpiresIn=3600
        )        
        assert url
    
    def test_upload_presigned_url(self):        
        url = get_upload_presigned_url('some-file-name.txt')
        self.assertIsNotNone(url)
        self.assertIsNot(url, {})
    
    def test_upload_file_S3(self):
        file_name = 'teste.txt'
        with open(file_name, 'w', encoding='utf-8') as _file:
            _file.write('Apenas um teste')
        
        _file_to_upload = open(file_name,'r').read()        
        url_to_upload = get_upload_presigned_url(file_name)        
        res = requests.post(            
            url_to_upload['url'],
            data = url_to_upload['fields'],
            files = {
                'file': (file_name, _file_to_upload)
            }
        )
        os.remove(file_name)        
        self.assertEqual(res.status_code, 204)

        
        

