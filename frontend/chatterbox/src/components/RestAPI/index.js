
const PORT = '8000';

class RestAPI {
    static API_ROOT = "https://chatterbox.app.br:" + PORT +"/api/";    
    static API_CREATE_CHAT = RestAPI.API_ROOT + "chat/new";
    static API_CADASTRA_USUARIO = RestAPI.API_ROOT + "users/new";
    static API_OBTEM_USUARIO = RestAPI.API_ROOT + "user/";
    static API_ACCESS_CHAT = RestAPI.API_ROOT + "chat/access/";
    static API_CHAT_USERS = RestAPI.API_ROOT + "chat/";
    static API_DELETE_CHAT = RestAPI.API_ROOT + "chat/";
    static API_URL_UPLOAD_S3 = RestAPI.API_ROOT + "upload_url/";
    static API_URL_DOWNLOAD_S3 = RestAPI.API_ROOT + "download_url/";
    //API_OBTEM_CHATS_USUARIO = API_ROOT + `users/${user_id}/chats`

    create_chat = (form_data) => {
        let url = RestAPI.API_CREATE_CHAT
        return new Promise((resolve, reject) => {
            fetch(
                url,
                {
                    method: 'POST',
                    body: form_data
                }
            )
            .then((response => response.json()))
            .then((result) => (resolve(result)))
            .catch((data) => reject(data));
        })
    }

    get_user_chats = (user) => {
        let url = RestAPI.API_ROOT + `user/${user.id}/chats`        
        return new Promise((resolve, reject)=> {
            fetch(url)
            .then((response)=> response.json())
            .then((result) => resolve(result))
            .catch((data) => reject(data));
        })
    }
    
    create_user = (form_data) =>{
        return new Promise((resolve, reject) => {
           fetch(RestAPI.API_CADASTRA_USUARIO, {method: "POST", body: form_data})
           .then(response => response.json())
           .then((result) =>{resolve(result)})
           .catch((data) => reject(data));
        });
    }

    get_user = (username) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_OBTEM_USUARIO + username)
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })
    }

    acess_chat = (user, chat_id) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_ACCESS_CHAT + user + '/' + chat_id)
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })
    }

    users_chat = (chat_id) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_CHAT_USERS + chat_id + '/users')
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })
    }

    delete_chat = (user_id, chat_id) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_DELETE_CHAT + user_id + "/" + chat_id, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })        
    }

    get_upload_url = (filename) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_URL_UPLOAD_S3 + filename)
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })
    }

    get_url_objeto_S3 = (filename) => {
        return new Promise((resolve, reject) => {
            fetch(RestAPI.API_URL_DOWNLOAD_S3 + filename)
            .then(response => response.json())
            .then(result => resolve(result))
            .catch(data => reject(data));
        })
    }
}

export default RestAPI