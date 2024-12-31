
import { useRef } from "react";
import "./ChatListItem.css";
import RestAPI from "../RestAPI";

const ChatListItem = (props) => {    
    let status_menu_modal = useRef(false);
    let api = new RestAPI();

    const showOptions = (event, id) => {        
        event.stopPropagation();
        event.preventDefault();
        console.log(id);
        let _menus = Array.from(document.getElementsByClassName('chatitems-menumodal'));
        _menus.forEach(m => {
            if (m.id != 'menu' + id){
                m.style.display = 'none';
            }
        });
        if (!status_menu_modal.current){
            document.getElementById('menu' + id).style.display = 'block';
            status_menu_modal.current = true;
        }
        else{
            document.getElementById('menu' + id).style.display = 'none';
            status_menu_modal.current = false;
        }
    }

    const deleteChat = (event) => {
        event.stopPropagation();
        event.preventDefault();
        let chat_id = event.target.parentElement.id.replace('menu','');
        event.target.parentElement.style.display = 'none';
        let chats_collection = JSON.parse(localStorage.getItem('chats_collection'));
        let chats_collection_updated = [];
        chats_collection.forEach((item) => {
            if(item.id != chat_id){
                chats_collection_updated.push(item);
            }
        })
        localStorage.setItem('chats_collection', JSON.stringify(chats_collection_updated));
        let user = JSON.parse(localStorage.getItem("user"));
        api.delete_chat(user.id, chat_id)
        .then((result) => {
            console.log(result);
        })
        .catch(data => console.log(data));
        props.onDelete();
    }


    return (
        <>
            <div className="chatitems" id={props.id} chat_id={props.chat_id} onClick={props.click}>            
                <div className="chatitems-label">
                    <span className="chatmessage" id={props.id} onClick={props.click}>
                        {props.last_message}
                    </span>
                </div>
                <div className="chatitems-options" onClick={event => showOptions(event, props.id)}>
                </div>
            </div>
            <div className="chatitems-menumodal" id={'menu' + props.id}>
                <span className="chatitems-menumodal-item" onClick={deleteChat}>
                    Excluir
                </span>
            </div>
        </>
    )    
}

export default ChatListItem
