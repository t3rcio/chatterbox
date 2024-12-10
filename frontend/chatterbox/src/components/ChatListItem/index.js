
import "./ChatListItem.css";

const ChatListItem = (props) => {    
    return (
        <div className="chatitems" id={props.id} chat_id={props.chat_id} onClick={props.click}>            
            <span className="chatmessage" id={props.id} onClick={props.click}>
                {props.last_message}
            </span>
        </div>
    )    
}

export default ChatListItem
