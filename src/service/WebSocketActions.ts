import { Client, Stomp } from '@stomp/stompjs';
import { useState } from 'react';

import SockJS from 'sockjs-client';

export const sendActionActivity = (accountId: string, action: string, data: object, description: string ) => {
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`);
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame: any) {
        // string actionNotApi = // tách /api ra khỏi action

        const actionWithoutApi = action.replace('/app/', '').trim(); 
        const dataSend = {
            activityType: actionWithoutApi ,
            accountId: accountId,
            description: description,
            timestamp: new Date().toISOString(),
            additionalData: data
        };
        stompClient.send(action, {}, JSON.stringify(dataSend));
    });
};