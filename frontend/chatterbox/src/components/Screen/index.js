
import {Socket, connections, onReceiveMessage} from '../Socket';
import Button from '../Button';
import "./Screen.css";
import { useEffect, useState } from 'react';

const Screen = (props) => {     
    
    let user = JSON.parse(localStorage.getItem("user"));
    let messages = JSON.parse(localStorage.getItem("messages"));
    const [conversation, setConversation] = useState(messages);
    
    useEffect(() => {
        let mensagens = document.getElementsByClassName('messages-frame');
        let ultima_mensagem = mensagens[mensagens.length - 1]
        if(ultima_mensagem){
            ultima_mensagem.scrollIntoView({behavior:"smooth", block:"end"});
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
        return (<>
                <div className="messages-frame" key={c.id + String(counter)} id={c.id + String(counter)}>
                    <div className='messages-user'></div>
                    <div className={"messages " + `${_class}`}>
                        <span>{c.user.username}</span>
                        <p>
                            {c.text}
                        </p>
                        <h6>{timestampToDateTime(c.timestamp)}</h6>
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
            <div className="screen" id={props.chat}>
                <div id="screen-header">
                    {/* <span>{props.chat}</span> */}                
                    <button className="header-button" onClick={props.showChatsList}>
                        Chats
                    </button>
                    <button className="header-button" onClick={openDialogShareBox}>
                        Compartilhar
                    </button>
                </div>            
                <div id="screen-body">
                    <div className="messages-container">
                        {conversa}
                    </div>
                </div>
                <div className="keyboard-container">
                    <textarea id="mensagem" placeholder="Digite sua mensagem aqui"></textarea>
                    <Button label="" click={enviar}/>
                </div>
            </div>            
        </>
    )
}

export default Screen

