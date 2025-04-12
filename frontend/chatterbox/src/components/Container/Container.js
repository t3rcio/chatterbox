
import { useState } from "react";
import App from "../../App";

const Container = () => {

    const STORAGE_KEYS = [
        'wsStatus',
        'messages',
        'currentChat',
        'chats_collection',
        'screen',
        'user'
    ];    
    const [screen, setScreen] = useState('');
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
        STORAGE_KEYS.forEach(key => {
            localStorage.removeItem(key);
        })
        document.getElementById("app-options-menumodal").style.display = 'none';
        setScreen("LOGIN");
    }
    
    const closeModals = (event) => {
        //event.stopPropagation(); // TODO: fix this
        //event.preventDefault(); // TODO: fix this
        let modais = Array.from(document.getElementsByClassName('menumodal'));
        modais.forEach(m => {
            m.style.display = 'none';
        })
    }    

    return (        
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
                    <span onClick={logoff}>Sair do App</span>
                </div>
                </div>
            </header>
            <div id="container">       
                <App screen={screen} />
            </div>
        </div>        
    )    
}

export default Container
