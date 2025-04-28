import React, { createContext, useContext, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const client = new Client({
        brokerURL: `ws://${process.env.REACT_APP_SERVER_HOST}/ws`,
        connectHeaders: {},
        onConnect: () => {
            console.log('Connected');
            client.subscribe('/topic/general', (message) => {
                console.log('Received:', message.body);
            });
        },
        onDisconnect: () => {
            console.log('Disconnected');
        },
        webSocketFactory: () => new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`),
    });

    useEffect(() => {
        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => useContext(WebSocketContext);
