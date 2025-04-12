
import React, { useEffect, useState } from 'react';
import './App.css';
import ChatListItem from './components/ChatListItem';
import RestAPI from './components/RestAPI';
import Screen from './components/Screen';

const App = (props) => {
  
  const LIMIT_SIZE_TEXT = 32;
  const LOADING_MAX_TIME = 2000;
  let api = new RestAPI();
  localStorage.setItem('wsStatus', 'DISCONNECTED');
  let user = JSON.parse(localStorage.getItem('user'));
  let init = "CADASTRO";
  let chats_collection = JSON.parse(localStorage.getItem('chats_collection'));
  let component = <></>  
  let messages = JSON.parse(localStorage.getItem("messages"));

  useEffect(() => {
    if (screen === "LOADING_CHATS") {
      setTimeout(()=> {
        setScreen("CHATSLIST");
      }, LOADING_MAX_TIME);
    }
  })

  if (messages == null){
    localStorage.setItem("messages", JSON.stringify([]));
  }
  
  if (chats_collection === null){
    chats_collection = [];
  }
  
  const getUserChats = () =>{
    let result = []
    if ([undefined, null].indexOf(user) > -1){      
      return result;
    }

    api.get_user_chats(user)
    .then((_result) => {
      let __chats = JSON.stringify(_result);
      if(_result.length > 0){
        chats_collection = _result;
        result = _result;
        localStorage.setItem('chats_collection', __chats);
      }
    })
    .catch((data) => console.error(data));
    return result;
  }

  const createUser= () => {    
    let form = document.getElementById('form-cadastro');
    let username = form.elements[1].value;
    let email = form.elements[0].value;
    if (Boolean(username) && Boolean(email)){
      let data = new FormData()
      data.append('username', username);
      data.append('email', email);
  
      api.create_user(data).then((user) => {
        localStorage.setItem("user", JSON.stringify(user));
      }).catch((data) => console.log(data));
      setScreen("NEWCHAT");
    }
    else{
      window.alert("Por favor, informe username e email");
    }
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
       
      chats_collection.push(chat);
      let _chat_collection = JSON.stringify(chats_collection);
      localStorage.setItem('chats_collection', _chat_collection);      
      localStorage.setItem('currentChat', chat.id);
      setScreen("CURRENTCHAT");
    }).catch((data) => {
      console.error(data);
    })    
  }  

  const getUser = () => {
    let _form = document.getElementById('form-login');
    let username = _form.elements[0].value;
    if(Boolean(username)){
      api.get_user(username)
      .then((result) => {
        if (Object.keys(result).length > 0){
          localStorage.setItem("user", JSON.stringify(result));
          user = result;
          chats_collection = getUserChats();
          setScreen("LOADING_CHATS");
        }
      })
    }
    else {
      window.alert("Informe o usuário.")
    }
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
    //event.preventDefault();
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

  const tenteNovamente = (event) => {
    setScreen("LOGIN");
  }

  const onDeleteChat = (event) => {
    setScreen("LOADING_CHATS");
  }

  if ([undefined, null].indexOf(user) < 0){
    if (chats_collection.length > 0){
      init = "CHATSLIST";
    }
    else {
      init = "NEWCHAT";
    }
  }
  else {
    init = "LOGIN";
    localStorage.setItem("currentChat", "");
  }

  const [screen, setScreen] = useState(init);
  
  switch(screen) {
    case "CADASTRO":
      component = <form id="form-cadastro">
                      <h3>
                        Acesse o Chatterbox
                      </h3>
                      <input type="text" placeholder="Digite seu email" required name="username" defaultValue={''}/>
                      <input type="text" placeholder="Digite um usuário" required name="email" defaultValue={''}/>
                      <button type='button' onClick={createUser} className='form-button success'>Criar conta</button>
                      <hr/>
                      <h3>Já tem uma conta? Faça seu login</h3>
                      <button className='form-button warning' onClick={_login}>Login</button>                      
                  </form>
      break;
    case "LOGIN":
      component = <form id="form-login">
                      <h3>ChatterBox - Login</h3>
                      <input type="text" name="username" placeholder="Digite seu usuário" required defaultValue={''}/>
                      <button type='button' onClick={getUser} className='form-button success'>Acessar</button>
                      <hr/>
                      <button type='button' className='form-button warning'onClick={event => {setScreen("CADASTRO")}}>
                        Criar conta
                      </button>                      
                  </form>
      break;
    case "LOADING_CHATS":
      component = <>
                    <div id="loading-chats">
                      <img src="/assets/icons/loading.gif"/>
                      <span>Carregando chats...</span>
                    </div>
                  </>
      break;
    case "WAITING":
      component = <>
                    <div id="loading-chats">
                      <img src="/assets/icons/loading.gif"/>
                      <span>Aguarde...</span>
                    </div>
                  </>
      break;
    case "CHATSLIST":
      let forcedScreen = Boolean(props.screen);
      if (forcedScreen){        
        setScreen(props.screen);
        break;
      }

      let items = [];
      let counter = 0;
      getUserChats();
      chats_collection = JSON.parse(localStorage.getItem("chats_collection")) || [];
      if (chats_collection === null) {
        setScreen("LOADING_CHATS");
      }
      if (chats_collection.length > 0){
        items = chats_collection.map((c) => {
          let last_message = get_chat_last_message(c.id) || 'Sem messagens';
          counter ++;
          return <ChatListItem id={c.id} key={c.id + String(counter)} chat_id={c.id} click={openChat} last_message={last_message} onDelete={onDeleteChat} />
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
            <button type="submit" className='form-button success'>Conversar</button>
            <hr/>
            <h3>Crie seu chat</h3>
            <button className="form-button warning" onClick={iniciarNovoChat}>
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
        <button onClick={iniciarNovoChat} className='form-button success'>Novo chat</button>        
        <hr/>
        <form id="form-chat" onSubmit={accessChat} >
            <h3>Ou cole um código de conversa recebido</h3>
            <input type="text" name="chat_id" placeholder="Cole o codigo da conversa aqui" defaultChecked={''} />
            <button type="submit" className="form-button warning">Acessar chat</button>
        </form>
      </div>
      </>
      break;
    case "ERROR":
      component = 
      <>
        <div id="error">
          <img src="assets/images/sad.png" width="64" alt="sad.png" title="Ocorreu um erro" />
          <h2>Erro ao obter os dados. Verifique sua conexão com a internet ou tente novamente</h2>
          <button className='form-button'onClick={tenteNovamente}>
            Tentar novamente
          </button>
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

