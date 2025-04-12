
const AWS = require('aws-sdk');
const S3_BUCKET = {    
    REGION: process.env.REACT_APP_REGION,
    NAME: process.env.REACT_APP_S3_BUCKET_NAME,
    URL: process.env.REACT_APP_S3_BUCKET_URL,
    ACCESS_KEY: process.env.REACT_APP_S3_ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.REACT_APP_S3_SECRET_ACCESS_KEY
}
const AWS_S3_API_VERSION = '2006-03-01';

class S3Service {    
    s3 = {}
    uploadParams = {
        Bucket: S3_BUCKET.NAME,
        Body: "",
        Key: "",
    }

    constructor() {
        AWS.config.update(
            {
                region:S3_BUCKET.REGION,
                accessKeyId: S3_BUCKET.ACCESS_KEY,
                secretAccessKey: S3_BUCKET.SECRET_ACCESS_KEY
            }
        );
        this.s3 = new AWS.S3({apiVersion:AWS_S3_API_VERSION});
    }

    upload(filename, filestream){
        return new Promise((resolve, reject) => {
            this.uploadParams.Body = filestream;
            this.uploadParams.Key = filename;
            let url = '';    
            this.s3.upload(this.uploadParams, (err, data) => {
                if (err) {
                    reject(err);
                }
                if (data){ 
                    url = S3_BUCKET.URL + filename;                    
                    resolve(url);
                }
            })            
        })
    }
}

export default S3Service
