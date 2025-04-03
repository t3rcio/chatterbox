
import {Socket, connections, onReceiveMessage} from '../Socket';
import Button from '../Button';
import "./Screen.css";
import { useEffect, useState } from 'react';
import RestAPI from '../RestAPI';

const Screen = (props) => {     
    
    let user = JSON.parse(localStorage.getItem("user"));
    let messages = JSON.parse(localStorage.getItem("messages"));
    const [conversation, setConversation] = useState(messages);
    let rest_api = new RestAPI();
    
    useEffect(() => {
        let mensagens = document.getElementsByClassName('messages-frame');
        let ultima_mensagem = mensagens[mensagens.length - 1]
        if(ultima_mensagem){
            ultima_mensagem.scrollIntoView({behavior:"smooth", block:"end"});
        }
    })

    useEffect(() => {
        let images = Array.from(document.getElementsByTagName("IMG"));
        let videos = Array.from(document.getElementsByTagName("VIDEO"));        
        for (let i of images) {
            let _parent = i.parentElement;
            i.key = crypto.randomUUID();
            fetch(i.src).then(response => {
                if(!response.ok){
                    i.src="assets/icons/out-of-time.png";
                    i.width="80";
                    i.alt = "out-of-time.png";
                    i.title = "Expirado. Solicite o reenvio do arquivo.";
                    let caption = document.createElement("SPAN");
                    caption.innerText = "Mídia expirada. Solicite o reenvio do arquivo";
                    _parent.appendChild(caption);
                }
            })
        }
        for (let v of videos) {
            v.key = crypto.randomUUID();
            fetch(v.src).then(response => {
                let _parent = v.parentElement;
                if(!response.ok){
                    v.remove();
                    let warning = document.createElement('IMG');                    
                    warning.src = "assets/icons/out-of-time.png";
                    warning.width = "80";
                    v.parentElement.appendChild(warning);
                    let caption = document.createElement("SPAN");
                    caption.innerText = "Mídia expirada. Solicite o reenvio do arquivo";
                    _parent.appendChild(caption);                    
                }
            })
        }
    })

    const timestampToDateTime = (timestamp) => {
        let date = new Date(timestamp * 1000);        
        let hours = date.getHours();        
        let minutes = "0" + date.getMinutes();        
        let seconds = "0" + date.getSeconds();        
        let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
        return formattedTime
    }
    
    let Message = {        
        "chat": {
            "id": props.chat
        },
        "text": "",
        "blob": "",
        "url": "",
        "type": "",
        "user": {
            "id": user.id,
            "username": user.username || user.email
        },
        "timestamp": Date.now()
    }   
    
    let websocket = {};
    let conection_ok = connections.filter((c) => {
        return c.chat === props.chat
    });
    
    if (conection_ok.length > 0) {
        websocket = conection_ok[0].socket;
        websocket.addEventListener('message', (event) => {
            onReceiveMessage(event, setConversation);
        });
    }
    else {
        websocket =  Socket({chat_id: props.chat});                
        localStorage.setItem("wsStatus", "READY");
    }     
    
    let items = conversation.filter((c) => {
        return c.chat.id === props.chat
    });    
    let counter = 0;
    let conversa = items.map(c => {
        let _class = user.id === c.user.id ? 'sent-messages' : 'received-messages';
        counter ++;
        if (c.blob){
            let _midia = <></>
            if (c.type.indexOf("video") > -1){
                _midia = <>
                    <video controls width="250">
                        <source src={c.url} type={c.type} />
                        Download the
                        <a href={c.url}>video</a>                        
                    </video>
                </>
            }
            else if (c.type.indexOf("image") > -1) {
                _midia = <>
                    <img src={c.url} alt={c.url}/>
                </>
            }
            else if (c.type.indexOf("pdf") > -1){
                _midia = <>
                    <a href={c.url}>
                        <img src="assets/images/pdf.png" alt="Arquivo PDF"/>
                    </a>
                </>
            }
            else {                
                _midia = <>
                    <a href={c.url}>
                        <img src="assets/images/fileunknow.png" alt="Arquivo desconhecido"/>
                    </a>
                </>
            }
            return (
            <>
                <div className="messages-frame" key={crypto.randomUUID()} id={c.id + String(counter)}>
                    <div className='messages-user' key={crypto.randomUUID()}></div>
                    <div className={"messages " + `${_class}`} key={crypto.randomUUID()}>
                        <span key={crypto.randomUUID()}>{c.user.username}</span>
                        <div className="img-frame">
                            {_midia}
                        </div>
                        <h6 key={crypto.randomUUID()}>{timestampToDateTime(c.timestamp)}</h6>
                    </div>     
                </div>
            </>                
            )
        }
        return (<>
                <div className="messages-frame" key={crypto.randomUUID()} id={c.id + String(counter)}>
                    <div className='messages-user' key={crypto.randomUUID()}></div>
                    <div className={"messages " + `${_class}`} key={crypto.randomUUID()}>
                        <span key={crypto.randomUUID()}>{c.user.username}</span>
                        <p key={crypto.randomUUID()}>
                            {c.text}
                        </p>
                        <h6 key={crypto.randomUUID()}>{timestampToDateTime(c.timestamp)}</h6>
                    </div>     
                </div>
            </>)
    });

    
    const enviar = (event) => {
        let message_field = document.getElementById("mensagem");
        let message = message_field.value;
        let __message = Message;
        __message.text = message;        
        websocket.send(JSON.stringify(__message));
        message_field.value = '';
    }

    const openDialogShareBox = (event) => {    
        document.getElementById("modal").style.display = 'block';
    }
    
    const closeModal = (event) => {
        if (event.target.id === 'modal' || event.target.id === 'close-modal'){
            document.getElementById("modal").style.display = 'none';
        }
    }
    
    const openFileSelectorDialog = (event) => {
        let uploadField = document.getElementById("uploadField");
        uploadField.click();
    }

    const upload = (event) => {
        let uploadField = event.target;
        let files = uploadField.files;        
        let reader = new FileReader();  
        let postData = new FormData();
        reader.onload = function (evt) {
            rest_api.get_upload_url(files[0].name).then(presigned_url => {
                postData.append("key", presigned_url.fields.key);
                postData.append("x-amz-credential", presigned_url.fields['x-amz-credential']);
                postData.append("x-amz-algorithm", presigned_url.fields['x-amz-algorithm']);
                postData.append("x-amz-date", presigned_url.fields['x-amz-date']);
                postData.append("policy", presigned_url.fields.policy);
                postData.append("x-amz-signature", presigned_url.fields['x-amz-signature']);
                postData.append("file", files[0]);                
                
                fetch(
                    presigned_url.url,
                    {
                        method: "POST",
                        body: postData,
                    }
                )
            });
        }
        rest_api.get_url_objeto_S3(files[0].name).then(obj_url => {
            let url_objeto = obj_url.url;
            try{
                let __message = Message;
                __message.blob = true;
                __message.type = files[0].type;
                __message.url = url_objeto;
                websocket.send(JSON.stringify(__message));
            }
            catch(err){
                console.log("Erro ao criar objeto Message com o objeto S3: ", err)
            }
        }).catch(data => console.log(data));
        
        reader.readAsArrayBuffer(files[0]);
    }

    localStorage.setItem("menu-current-chat", "hidden");
    return (
        <>
            <div id="modal" onClick={closeModal}>
                <div id="modal-dialog">
                    <div id="modal-header">
                    Compartilhando o Chat
                    </div>
                    <div id="modal-body">
                    <span>Copie o código e envie para seu contato</span>
                    <input className='input-share' id="input-chat-id-shared" value={props.chat} readOnly type='text'/>
                    <button className='button-share' id="close-modal" onClick={closeModal}>Fechar</button>
                    </div>
                </div>
            </div>
            <div className="screen" key={crypto.randomUUID()}>
                <div id="screen-header" key={crypto.randomUUID()}>
                    {/* <span>{props.chat}</span> */}                
                    <button className="header-button" onClick={props.showChatsList} key={crypto.randomUUID()}>
                        Chats
                    </button>
                    <button className="header-button" onClick={openDialogShareBox} key={crypto.randomUUID()}>
                        Compartilhar
                    </button>
                    <button className="header-button" onClick={openDialogShareBox} key={crypto.randomUUID()}>
                        Excluir
                    </button>                    
                </div>            
                <div id="screen-body" key={crypto.randomUUID()}>
                    <div className="messages-container" key={crypto.randomUUID()}>
                        {conversa}
                    </div>
                </div>
                <div className="keyboard-container" key={crypto.randomUUID()}>
                    <textarea id="mensagem" placeholder="Digite sua mensagem aqui" key={crypto.randomUUID()}></textarea>
                    <Button label="" click={enviar} key={crypto.randomUUID()}/>                    
                    <input type="file" id="uploadField" onChange={upload} style={{display:'none'}}/>
                    <button id="fileSelect" type="button" onClick={openFileSelectorDialog}></button>
                </div>
            </div>            
        </>
    )
}

export default Screen

