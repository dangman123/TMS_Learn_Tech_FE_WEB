import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { ref, onValue, push, update } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { database } from "../../../util/fucntion/firebaseConfig";
import "./chatUser.css";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";

type Message = {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  timestamp: string;
};

type User = {
  fullname: string;
  email: string;
  status: string;
};

type Conversation = {
  id: string;
  participants: string[];
  lastMessage: string;
  timestamp: string;
  otherUser: {
    fullname: string;
    email: string;
    status: string;
  } | null;
};

const Chat: React.FC = () => {

  const [searchKeyword, setSearchKeyword] = useState(""); // State lưu trữ từ khóa tìm kiếm

  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOverlayOpen, setOverlayOpen] = useState(false);
  const [listUserIDs, setListUserIDs] = useState<string[]>([]);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const [account, setAccount] = useState<any | null>(null); // Lưu thông tin người dùng

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  const fetchCourseAuthors = async () => {
    if (account) {
      try {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
          token = await refresh();
          if (!token) {
            navigate("/dang-nhap");
            return;
          }
          localStorage.setItem("authToken", token);
        }
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/api/course-authors/${account.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setListUserIDs(data);
      } catch (error) {
        console.error("Error fetching course authors", error);
      }
    }
  };

  useEffect(() => {
    const accountData = getUserData();
    setAccount(accountData);
  }, []);
  useEffect(() => {
    fetchCourseAuthors();
  }, [account]);
  const openOverlay = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setOverlayOpen(true);
  };

  const closeOverlay = () => {
    setSelectedImage(null);
    setOverlayOpen(false);
  };

  // Lấy thông tin người dùng từ Firebase
  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data);
      }
    });
  }, []);

  useEffect(() => {
    if (account?.id && listUserIDs.length > 0) {
      const conversationsRef = ref(database, "conversations");

      onValue(conversationsRef, (snapshot) => {
        const data = snapshot.val(); // Lấy dữ liệu từ snapshot

        if (data) {
          // Lọc và xử lý cuộc trò chuyện
          console.log(data);
          const userConversations = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .filter(
              (conv) =>
                String(conv.participants).includes(String(account.id)) &&
                conv.participants.some((id: string) => listUserIDs.includes(id))
            )
            .map((conv) => {
              const otherUserId = conv.participants.find(
                (id: string) => id !== String(account.id)
              );
              const otherUser = otherUserId ? users[otherUserId] : null;
              return { ...conv, otherUser };
            });

          // Chỉ cập nhật state nếu cuộc trò chuyện mới khác với state hiện tại
          if (
            JSON.stringify(userConversations) !== JSON.stringify(conversations)
          ) {
            setConversations(userConversations); // Cập nhật state nếu có thay đổi
          }
        }
      });
    }
  }, [account?.id, listUserIDs, users, conversations]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (messageText.trim() && activeConversationId) {
      const newMessage = {
        senderId: account.id,
        text: messageText,
        timestamp: new Date().toISOString(),
      };

      const messageRef = ref(database, `messages/${activeConversationId}`);
      await push(messageRef, newMessage);

      const conversationRef = ref(
        database,
        `conversations/${activeConversationId}`
      );
      await update(conversationRef, {
        lastMessage: messageText,
        timestamp: new Date().toISOString(),
      });

      setMessageText("");
    }
  };

  useEffect(() => {
    if (activeConversationId) {
      const messagesRef = ref(database, `messages/${activeConversationId}`);
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setMessages(messageList);
        }
      });
    }
  }, [activeConversationId]);
  const handleImageUpload = async (file: File | undefined) => {
    if (!file || !activeConversationId) return;

    const storage = getStorage();
    const storageReference = storageRef(storage, `imagesChat/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const newMessage = {
        senderId: account.id,
        image: downloadURL,
        timestamp: new Date().toISOString(),
      };

      const messageRef = ref(database, `messages/${activeConversationId}`);
      await push(messageRef, newMessage);
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
    }
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  const filteredConversations = conversations.filter((conversation) => {
    const fullname = conversation.otherUser?.fullname || "";
    return fullname.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  return (
    <div
      className="chat-user-container user"
      style={{ display: "flex", height: "82vh" }}
    >
      {/* Sidebar */}
      <div className="chat-sidebar user" style={{ overflow: "auto" }}>
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="search-chat-admin"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <List>
          {filteredConversations.map((conversation) => (
            <ListItem
              button
              key={conversation.id}
              selected={conversation.id === activeConversationId}
              onClick={() => setActiveConversationId(conversation.id)}
            >
              <ListItemAvatar>
                <Avatar>{conversation.otherUser?.fullname[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={conversation.otherUser?.fullname}
                secondary={conversation.lastMessage}
              />
            </ListItem>
          ))}
        </List>
      </div>

      <div className="message-list user">
        <div className="chat-header">
          <Avatar>{activeConversation?.otherUser?.fullname[0]}</Avatar>
          <h3>{activeConversation?.otherUser?.fullname}</h3>
          <p>{activeConversation?.otherUser?.email}</p>
        </div>
        <div className="message-content" style={{ height: "82%" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-item ${msg.senderId === account.id ? "outgoing" : "incoming"
                }`}
            >
              <div
                className={`${msg.senderId === account.id
                  ? "message-chat-btn-right"
                  : "message-chat-btn-left"
                  }`}
              >
                {msg.image && (
                  <div
                    className="message-image"
                    onClick={() => openOverlay(msg.image!)}
                  >
                    <img
                      src={msg.image}
                      alt="Image"
                      style={{ cursor: "pointer", maxWidth: "200px" }}
                    />
                  </div>
                )}

                {/* Tin nhắn và giờ */}
                <div className="message-text">{msg.text}</div>
                <div
                  className={`message-timestamp ${msg.senderId === account.id ? "outgoing" : "incoming"
                    }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="message-input user">
          <TextField
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <input
            accept="image/*"
            id="upload-image"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />
          <label htmlFor="upload-image">
            <IconButton component="span">📷</IconButton>
          </label>
          <IconButton onClick={handleSendMessage}>
            <Send />
          </IconButton>
        </div>
      </div>

      {/* Overlay for Image */}
      {isOverlayOpen && selectedImage && (
        <div className="overlay chat" onClick={closeOverlay}>
          <div
            className="overlay-content chat"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Phóng to"
              style={{ maxWidth: "100%", maxHeight: "90vh" }}
            />
            <button className="close-button chat" onClick={closeOverlay}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
