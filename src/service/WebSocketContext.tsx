import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
    import SockJS from 'sockjs-client';

// Create a proper typed context with null as default
const WebSocketContext = createContext<Client | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use state to store client reference to ensure proper rendering cycles
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        // Only execute in browser environment
        if (typeof window === 'undefined') return;

        let stompClient: Client | null = null;

        try {
            // Create client only once in the effect
            stompClient = new Client({
                // Remove brokerURL and rely only on webSocketFactory
                connectHeaders: {},
                onConnect: () => {
                    console.log('WebSocket Connected');
                    // Safe subscription
                    if (stompClient && stompClient.connected) {
                        stompClient.subscribe('/topic/general', (message) => {
                            console.log('Received:', message.body);
                        });
                    }
                },
                onDisconnect: () => {
                    console.log('WebSocket Disconnected');
                },
                // Add error handlers
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                },
                // Create SockJS instance only when needed
                webSocketFactory: () => new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`),
                // Prevent reconnection attempts which might cause errors
                reconnectDelay: 0,
                heartbeatIncoming: 0,
                heartbeatOutgoing: 0
            });

            // Save to state
            setClient(stompClient);

            // Safely activate
            if (stompClient) {
                try {
                    stompClient.activate();
                } catch (error) {
                    console.error('Failed to activate WebSocket:', error);
                }
            }
        } catch (error) {
            console.error('Error creating WebSocket client:', error);
        }

        // Cleanup function
        return () => {
            if (stompClient) {
                try {
                    if (stompClient.active) {
                        stompClient.deactivate();
                    }
                } catch (error) {
                    console.error('Error deactivating WebSocket:', error);
                }
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={client}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
