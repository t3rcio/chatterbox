
const WS_API_ROOT = 'ws://chatterbox-backend:9000';
const WS_API_CHAT = WS_API_ROOT + '/chat/';
let connections = []

const onReceiveMessage = (event, onReceiveCallback) => {
    let message = JSON.parse(event.data);        
    let messages = JSON.parse(localStorage.getItem("messages"));        
    let mensagem_ja_gravada = messages.filter((e) => {
        return e.id == message.id
    });

    if (mensagem_ja_gravada.length == 0){
        messages.push(message);
        localStorage.setItem("messages", JSON.stringify(messages));
        onReceiveCallback(messages);
    }    

}

const Socket = (props) => {
    const TIME_TO_RECONNECT = 2 // segundos
    let websocket = new WebSocket(WS_API_CHAT + props.chat_id);
    websocket.addEventListener('close', ()=>{
        localStorage.setItem('wsStatus', 'DISCONNECTED');
        setTimeout(()=>{
            console.log("Reconnecting...");            
            websocket = new WebSocket(WS_API_CHAT + props.chat_id);            
            localStorage.setItem('wsStatus', 'READY');
        }, TIME_TO_RECONNECT);
    });
    
    connections.push({
        chat: props.chat_id,
        socket: websocket
    })

    return websocket
}


export {Socket, connections, onReceiveMessage}
