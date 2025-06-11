import { useEffect, useState } from 'react';

interface CozeConfig {
  botId?: string;
  token?: string;
  title?: string;
  saveHistory?: boolean;
}

declare global {
  interface Window {
    CozeWebSDK: any;
  }
}

export const useCozeChat = ({
  botId = '7480578588807610384',
  token = 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe',
  title = 'TMS Chat',
  saveHistory = false
}: CozeConfig = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Generate a UUID for user identification
  const generateUUID = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    arr[6] = (arr[6] & 0x0f) | 0x40;
    arr[8] = (arr[8] & 0x3f) | 0x80;
    return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // API call function with Bearer token
  const callAPI = async (url: string, method = "GET", body = null) => {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(`✅ API: ${url}`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error calling API: ${url}`, error);
    }
  };

  // Fetch conversation data
  const fetchConversationData = async () => {
    const url = `https://api.coze.com/v1/conversations?bot_id=${botId}&connector_id=999&page_num=1&page_size=1`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.data?.conversations?.length > 0) {
        const lastSectionId = data.data.conversations[0].last_section_id;
        console.log('Response Data ID Conversation last:', lastSectionId);
        setCurrentConversationId(lastSectionId);
        return lastSectionId;
      } else {
        console.log('No conversations found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  // Get message list from a conversation
  const getMessageList = async (conversation_id: string) => {
    const url = `https://api.coze.com/v1/conversation/message/list?conversation_id=${conversation_id}`;
    const response = await callAPI(url, "GET");

    if (response?.data?.length > 0) {
      return response.data.map((msg: any) => msg.id);
    } else {
      console.warn("⚠ No messages in this conversation.");
      return [];
    }
  };

  // Delete messages from a conversation
  const deleteMessages = async (messageIds: string[], conversation_id: string) => {
    for (const messageId of messageIds) {
      const url = `https://api.coze.com/v1/conversation/message/delete?conversation_id=${conversation_id}&message_id=${messageId}`;
      await callAPI(url, "POST");
    }
  };

  // Delete all messages in the current conversation
  const deleteAllMessages = async () => {
    const conversation_id = await fetchConversationData();
    
    if (!conversation_id) return;
    
    const messageIds = await getMessageList(conversation_id);

    if (messageIds.length > 0) {
      await deleteMessages(messageIds, conversation_id);
      console.log("✅ All messages deleted successfully.");
    } else {
      console.log("⚠ No messages to delete.");
    }
  };

  // Initialize the chat client
  const initializeChat = () => {
    if (!window.CozeWebSDK) {
      console.error('CozeWebSDK is not loaded');
      return;
    }

    // Get or create user ID
    let userId = sessionStorage.getItem("userId");
    if (!userId) {
      userId = generateUUID();
      sessionStorage.setItem("userId", userId);
      // Clear previous messages when it's a new user
      if (!saveHistory) {
        deleteAllMessages();
      }
    }

    // Random nicknames
    const randomNicknames = [
      "User123", "Anonymous", "Guest456", "JohnDoe",
      "Alice", "Bob", "CyberWarrior", "AI_Lover",
    ];
    const nickname = randomNicknames[Math.floor(Math.random() * randomNicknames.length)];

    // Random avatars
    const randomAvatars = [
      "https://i.pravatar.cc/100?img=1",
      "https://i.pravatar.cc/100?img=2", 
      "https://i.pravatar.cc/100?img=3",
      "https://i.pravatar.cc/100?img=4",
      "https://i.pravatar.cc/100?img=5",
    ];
    const avatarUrl = randomAvatars[Math.floor(Math.random() * randomAvatars.length)];

    // Initialize chat client
    new window.CozeWebSDK.WebChatClient({
      config: {
        bot_id: botId,
        save_history: saveHistory,
      },
      componentProps: {
        title: title,
      },
      auth: {
        type: "token",
        token: token,
        onRefreshToken: function () {
          return token;
        },
      },
      userInfo: {
        id: userId,
        url: avatarUrl,
        nickname: nickname,
      },
      ui: {
        base: {
          icon: "https://firebasestorage.googleapis.com/v0/b/learn-with-tms-4cc08.appspot.com/o/image%2FBlue%20White%20Illustrated%20Question%20Chatbot%20Logo.png?alt=media&token=d259b25c-c427-42ce-954e-fea5425db2c3",
          layout: "pc",
          zIndex: 1000,
        },
      },
      header: {
        isShow: false,
        isNeedClose: false,
      },
      asstBtn: {
        isNeed: true,
      },
      session: {
        conversation_id: generateUUID(),
      },
    });

    setIsInitialized(true);
  };

  // Load SDK script
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js';
      script.async = true;
      script.onload = () => {
        initializeChat();
      };
      document.body.appendChild(script);
      
      // Cleanup function
      return () => {
        document.body.removeChild(script);
      };
    } else if (window.CozeWebSDK && !isInitialized) {
      // If script already exists but chat not initialized
      initializeChat();
    }
  }, []);

  return {
    deleteAllMessages,
    currentConversationId,
    isInitialized
  };
};

export default useCozeChat; 