import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
const redirect = () => {
  window.location.href = '/';
}

const openMenu = () => {
  let screen = localStorage.getItem('screen');
  switch(screen) {
    case 'CURRENTCHAT':
      if(localStorage.getItem("menu-current-chat") === "hidden" || localStorage.getItem("menu-current-chat") === null){
        document.getElementById('screen-header').style.display = 'block';
        localStorage.setItem("menu-current-chat", "visible");
      }
      else {
        document.getElementById('screen-header').style.display = 'none';
        localStorage.setItem("menu-current-chat", "hidden");
      }
    break;
    
  }
}

const openMenuOptionsModal = (event) => {
  event.stopPropagation();
  event.preventDefault();  
  document.getElementById("app-options-menumodal").style.display = 'block';
}

const logoff = (event) => {
  event.stopPropagation();
  event.preventDefault();  
  localStorage.clear();
  document.getElementById("app-options-menumodal").style.display = 'none';
}

const closeModals = (event) => {
  event.stopPropagation();
  event.preventDefault();
  let modais = Array.from(document.getElementsByClassName('menumodal'));
  modais.forEach(m => {
    m.style.display = 'none';
  })
}


root.render(
  <React.StrictMode>
    <div className="App" onClick={closeModals}>
      <header id="header">
        <div id="logo">
          <img src="assets/icons/logo.png" alt="logo" title="Chatterbox" onClick={openMenu}/>
        </div>
        <span>
          ChatterBox
        </span>
        <div id="app-options" onClick={openMenuOptionsModal}>
          <div className='menumodal' id="app-options-menumodal">
            <span onClick={logoff}>Sair</span>
          </div>
        </div>
      </header>
      <div id="container">       
        <App />
      </div>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
