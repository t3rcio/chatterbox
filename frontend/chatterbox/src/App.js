
import React, { useState } from 'react';
import './App.css';
import ChatListItem from './components/ChatListItem';
import RestAPI from './components/RestAPI';
import Screen from './components/Screen';

const App = () => {
  
  const LIMIT_SIZE_TEXT = 32;
  let api = new RestAPI();
  localStorage.setItem('wsStatus', 'DISCONNECTED');
  let user = JSON.parse(localStorage.getItem('user'));
  let init = "CADASTRO";
  let chats_collection = JSON.parse(localStorage.getItem('chats_collection'));  
  let component = <></>  
  let messages = JSON.parse(localStorage.getItem("messages"));
  if (messages == null){
    localStorage.setItem("messages", JSON.stringify([]));
  }
  
  if (chats_collection == null){
    chats_collection = [];
  }
  
  const getUserChats = () =>{
    if ([undefined, null].indexOf(user) > -1){      
      return []
    }

    api.get_user_chats(user)
    .then((_result) => {
      let __chats = JSON.stringify(_result);
      localStorage.setItem('chats_collection', __chats);
      chats_collection = _result;      
    })
    .catch((data) => console.error(data));
  }

  const createUser= (event) => {
    event.preventDefault();
    let form = document.getElementById('form-cadastro');
    let username = form.elements[1].value;
    let email = form.elements[0].value;
    let data = new FormData()
    data.append('username', username);
    data.append('email', email);

    api.create_user(data).then((user) => {
      localStorage.setItem("user", JSON.stringify(user));
    }).catch((data) => console.log(data));
    setScreen("NEWCHAT");
  }

  const iniciarNovoChat = (event) => {
    let data = new FormData()
    let user = JSON.parse(localStorage.getItem("user")); 
    let chats_collection = JSON.parse(localStorage.getItem("chats_collection"));
    data.append('user_id', user.id)
    let api = new RestAPI();
    api.create_chat(data).then((chat) => {
      
      if([undefined, null].indexOf(chats_collection) > -1){
        chats_collection = [];
      }
      else {
        chats_collection = JSON.parse(localStorage.getItem('chats_collection'));
      }        
       
      chats_collection.push(chat);
      let _chat_collection = JSON.stringify(chats_collection);
      localStorage.setItem('chats_collection', _chat_collection);      
      localStorage.setItem('currentChat', chat.id);
      setScreen("CURRENTCHAT");
    }).catch((data) => {
      console.error(data);
    })    
  }  

  const getUser = (event) => {
    event.preventDefault();
    let username = event.target.elements[0].value;
    api.get_user(username)
    .then((result) => {
      localStorage.setItem("user", JSON.stringify(result));
      getUserChats();
      setScreen("CHATSLIST");
    })

  }

  const acessSharedChat = (event) => {
    let chat_id = document.getElementById("input-chat-id-shared").value;
    let user = JSON.parse(localStorage.getItem("user"));
    if (Boolean(chat_id)){
      api.acess_chat(user.id, chat_id)
      .then((result) => {
        chats_collection.push(chat_id);
        let __chats = JSON.stringify(chats_collection)
        localStorage.setItem("chats_collection", __chats);
        localStorage.setItem("currentChat", chat_id);
        setScreen("CURRENTCHAT");
      })
    }
    document.getElementById("input-chat-id-shared").value = '';
  }

  const accessChat = (event) => {
    event.preventDefault();
    let chat_id = event.target.elements[0].value;
    let user = JSON.parse(localStorage.getItem("user"));
    if (Boolean(chat_id)){
      api.acess_chat(user.id, chat_id)
      .then((result) => {
        chats_collection.push(chat_id);
        let __chats = JSON.stringify(chats_collection)
        localStorage.setItem("chats_collection", __chats);
        localStorage.setItem("currentChat", chat_id);
        setScreen("CURRENTCHAT");
      })
    }
  }

  const openChat = (event) => {    
    localStorage.setItem("currentChat", event.target.id);
    setScreen("CURRENTCHAT");
  }

  const showChatsList = (event) => {
    localStorage.setItem("currentChat", event.target.id);
    setScreen("CHATSLIST");
  }

  const _login = (event) => {
    setScreen("LOGIN");
  }

  const get_chat_last_message = (chat_id) => {
    let result = '';
    let chat_messages = Array.from(messages).filter(m => {
      return m.chat.id === chat_id
    });    
    if(chat_messages.length > 0){      
      result = chat_messages[chat_messages.length - 1].text;
      if (result.length > LIMIT_SIZE_TEXT){
        result = result.substring(0,LIMIT_SIZE_TEXT) + ' ...';
      }
    }
    return result
  }

  const openDialogShareBox = (event) => {    
    document.getElementById("modal").style.display = 'block';
  }

  const closeModal = (event) => {
    if (event.target.id === 'modal'){
      document.getElementById("modal").style.display = 'none';
    }
  }

  if (Boolean(user)){
    getUserChats();    
    if (Boolean(chats_collection)){
      init = "CHATSLIST";
    }
    else {
      init = "NEWCHAT";
    }
  }
  else {
    localStorage.setItem("currentChat", "");
  }

  const [screen, setScreen] = useState(init);
  
  switch(screen) {
    case "CADASTRO":
      component = <form id="form-cadastro" onSubmit={createUser}>
                      <h3>
                        Acesse o Chatterbox
                      </h3>
                      <input type="text" placeholder="Digite seu email" required name="username" defaultValue={''}/>
                      <input type="text" placeholder="Digite um usuário" required name="email" defaultValue={''}/>
                      <button type='submit' className='form-button'>Criar conta</button>
                      <hr/>
                      <h3>Já tem uma conta? Faça seu login</h3>
                      <button className='form-button' onClick={_login}>Login</button>                      
                  </form>
      break;
    case "LOGIN":
      component = <form id="form-login" onSubmit={getUser}>
                      <h3>ChatterBox - Login</h3>
                      <input type="text" name="username" placeholder="Digite seu usuário" defaultValue={''}/>
                      <button type='submit' className='form-button'>Acessar</button>
                  </form>
      break;
    case "CHATSLIST":
      let items = [];
      let counter = 0;
      chats_collection = JSON.parse(localStorage.getItem('chats_collection'));
      if (chats_collection.length > 0){
        items = chats_collection.map((c) => {
          let last_message = get_chat_last_message(c.id) || 'Sem messagens';
          counter ++;
          return <ChatListItem id={c.id} key={c.id + String(counter)} chat_id={c.id} click={openChat} last_message={last_message} />
        });
        
        component = <>
        <div id="modal" onClick={closeModal}>
          <div id="modal-dialog">
            <div id="modal-header">
              Acessando um Chat
            </div>
            <div id="modal-body">
              <span>Cole o código do chat que você recebeu</span>
              <input className='input-share' id="input-chat-id-shared" type='text'/>
              <button className='button-share' onClick={acessSharedChat}>Acessar</button>
            </div>
          </div>
        </div>

        <div className='chatlist-frame'>
          {items}
        </div>
        <div id='floating-button' onClick={openDialogShareBox}></div>
        </>      
      } 
      else {
        component = <form id="form-chat" onSubmit={accessChat} >
            <h3>Foi convidado para um chat?</h3>
            <input type="text" name="chat_id" placeholder="Cole o codigo da conversa aqui" defaultChecked={''} />
            <button type="submit" className='form-button'>Conversar</button>
            <hr/>
            <h3>Crie seu chat</h3>
            <button className="form-button" onClick={iniciarNovoChat}>
              Iniciar chat
            </button>
          </form>        
      }      
      break;
    case "CURRENTCHAT":
      component = <Screen chat={localStorage.getItem('currentChat')} showChatsList={showChatsList} />
      break;
    case "NEWCHAT":
      component = 
      <>
      <div id="novo-chat">
        <h2>
          Comece a conversar no Chatterbox
        </h2>
        <button onClick={iniciarNovoChat} className='form-button'>Novo chat</button>        
        <hr/>
        <form id="form-chat" onSubmit={accessChat} >
            <h3>Ou cole um código de conversa recebido</h3>
            <input type="text" name="chat_id" placeholder="Cole o codigo da conversa aqui" defaultChecked={''} />
            <button type="submit" className="form-button">Acessar chat</button>
        </form>
      </div>
      </>
      break;
    default:      
      break;
  }
  localStorage.setItem('screen', screen);
  return (component)
}

export default App;

