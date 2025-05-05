

import asyncio
import socket

from wsserver.server import main

DEFAULT_PORT = 9010
PORT_OCUPPIED = 0

def test_server():
    '''
    Whether the server is running
    '''
    # prepare
    server_socket_status = False
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as _ssocket:
        server_socket_status = _ssocket.connect_ex(('localhost', DEFAULT_PORT)) == PORT_OCUPPIED
    
    # execute
    main(port=DEFAULT_PORT)

    # assert
    assert server_socket_status == True

