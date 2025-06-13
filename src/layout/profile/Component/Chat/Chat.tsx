import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";

// Ant Design components
import {
  Typography,
  Card,
  Layout,
  Button,
  Space,
  Tag,
  Input,
  List,
  Select,
  message as antMessage,
  Modal,
  Form,
  Row,
  Col,  
  Tabs,
  Badge,
  Tooltip,
  Avatar,
  Divider,
  Drawer,
  Menu,
  Empty,
  Popconfirm,
  Spin,
  Upload,
  Image,
  Progress,
} from "antd";

// Ant Design Icons
import {
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  SearchOutlined,
  PaperClipOutlined,
  StarOutlined,
  StarFilled,
  FilterOutlined,
  MoreOutlined,
  MailOutlined,
  PictureOutlined,
  InboxOutlined,
  FileTextOutlined,
  FileOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  LoadingOutlined,
  BellOutlined,
} from "@ant-design/icons";

// Other libraries
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

// Ant Design icons
import { RcFile } from 'antd/lib/upload';
import { FileUnknownOutlined, FilePdfOutlined, FileWordOutlined } from '@ant-design/icons';
import { DownloadOutlined } from "@mui/icons-material";

// Ant Design components (as needed)
import TextArea from "antd/lib/input/TextArea";
import { UploadFile } from "antd/lib";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Sider, Content } = Layout;

interface Message {
  id: number;
  content: string;
  senderId?: number;  // Added to match the received format
  fromId?: number;    // Keep for backward compatibility
  receiveId?: number;
  conversationId?: number; // Added to match the received format
  senderUsername?: string;
  avatarUrl?: string;     // URL to the sender's avatar
  messageType?: string;    // Added to match the received format
  status?: string;         // Added to match the received format
  timestamp: string;
  imageUrl?: string;       // URL to the image if it's an image message
  fileUrl?: string;     // URL to the file
  fileName?: string;    // Original file name
  fileSize?: number;    // File size in bytes
  fileType?: string;    // MIME type of the file
  fromImage?: string;
  receivedImage?: string;
}
interface Contact {
  id: string;
  name: string;
  receivedName?: string;
  avatar?: string;
  type: 'private' | 'group';
  status: 'online' | 'offline' | 'busy';
  lastActive?: string;
  unreadCount: number;
  roleReceiver?: string;
  roleSender?: string;
  fromEmail?: string;
  receivedEmail?: string;
  lastMessage?: Message;
  lastMessageTimestamp?: string;
}


interface Conversation {
  id: number;
  name: string;
  type: 'private' | 'group';
  fromName?: string;
  receivedName?: string;
  fromId?: number;
  receiverId?: number;
  avatarFrom?: string;
  avatarReceived?: string;
  fromEmail?: string;
  receivedEmail?: string;
  messages: Message[];
  lastMessage?: Message;
  lastMessageTimestamp?: string;
  unreadCount?: number;
  roleReceiver?: string;
  roleSender?: string;
}

const MessagesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [newMessage, setNewMessage] = useState<string>("");
  const [isComposeVisible, setIsComposeVisible] = useState<boolean>(false);
  const [composeForm] = Form.useForm();

  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline');

  // API data states
  const [apiConversations, setApiConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // STOMP client for WebSocket connection
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // Add a counter to force re-render when messages update
  const [messageUpdateCounter, setMessageUpdateCounter] = useState(0);
  const [selectedImage, setSelectedImage] = useState<UploadFile | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // State for file handling
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Filter contacts by search text and tab type
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = !searchText ||
        contact.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesTab = activeTab === contact.type;
      return matchesSearch && matchesTab;
    });
  }, [contacts, searchText, activeTab]);

  const filteredMessages = useMemo(() => {
    if (!selectedConversation || !selectedConversation.messages) return [];

    // If no search, return all messages
    if (!searchText) return selectedConversation.messages;

    // Filter by search text
    return selectedConversation.messages.filter(message =>
      message.content.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [selectedConversation, searchText, messageUpdateCounter]);
  // Fetch user data from localStorage
  const getCurrentUserId = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        return userData.id;
      } catch (error) {
        console.error("Error parsing authData:", error);
      }
    }
    return null;
  };
  // Fetch conversations from API
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error("User ID not found");
        setLoading(false);
        return;
      }

      setCurrentUserId(userId);

      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Auth token not found");
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/chat/conversations/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Sort messages in each conversation with newest at the bottom
      const conversationsWithSortedMessages = response.data.map((conv: Conversation) => {
        if (conv.messages && Array.isArray(conv.messages)) {
          // Sort by timestamp, with oldest messages first
          const sortedMessages = [...conv.messages].sort((a, b) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          });
          return { ...conv, messages: sortedMessages };
        }
        return conv;
      });

      setApiConversations(conversationsWithSortedMessages);

      // Select first conversation by default
      if (conversationsWithSortedMessages.length > 0) {
        setSelectedConversation(conversationsWithSortedMessages[0]);
      }

      // Create contacts from conversations with type
      const extractedContacts: Contact[] = conversationsWithSortedMessages.map((conv: Conversation) => ({
        id: conv.id.toString(),
        name: conv.type === 'group' ? conv.name : conv.receivedName,
        avatar: conv.avatarReceived,
        type: conv.type, // Set type based on conversation type
        status: 'offline',
        unreadCount: 0,
        roleReceiver: conv.roleReceiver,
        roleSender: conv.roleSender,
        lastActive: conv.lastMessageTimestamp,
        lastMessage: conv.lastMessage,
        lastMessageTimestamp: conv.lastMessageTimestamp,
        fromEmail: conv.fromEmail,
        receivedEmail: conv.receivedEmail,
      }));

      setContacts(extractedContacts);

      // Select first contact of current tab type
      const contactsOfCurrentTabType = extractedContacts.filter((c: Contact) => c.type === activeTab);
      if (contactsOfCurrentTabType.length > 0) {
        setSelectedContact(contactsOfCurrentTabType[0]);
        // Find corresponding conversation
        const conversation = conversationsWithSortedMessages.find((c: Conversation) => c.id.toString() === contactsOfCurrentTabType[0].id);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      } else if (extractedContacts.length > 0) {
        // If no contacts of current tab type, select the first one and switch tab
        setSelectedContact(extractedContacts[0]);
        setActiveTab(extractedContacts[0].type);
        // Find corresponding conversation
        const conversation = conversationsWithSortedMessages.find((c: Conversation) => c.id.toString() === extractedContacts[0].id);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }

    } catch (error) {
      console.error("Error fetching conversations:", error);
      antMessage.error("Không thể tải dữ liệu hội thoại");
    } finally {
      setLoading(false);
    }
  };
  // Connect to WebSocket server and handle messages
  useEffect(() => {
    let client: Client | null = null;

    const connectWebSocket = () => {
      console.log("Connecting to WebSocket...");
      const socket = new SockJS('http://localhost:8080/ws');
      client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 2000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected to WebSocket');
        setConnectionStatus('online');

        const userId = getCurrentUserId();
        if (userId) {

          // Subscribe to private messages
          client!.subscribe(`/user/${userId}/queue/messages`, (message) => {
            try {
              const receivedMsg = JSON.parse(message.body);
              // console.log('Received message:', receivedMsg);

              // Make sure the message has all required properties
              if (receivedMsg.messageType === 'image' && receivedMsg.imageUrl) {
                //  console.log('Received image message with URL:', receivedMsg.imageUrl);
              } else if (receivedMsg.messageType === 'file' && receivedMsg.fileUrl) {
                // console.log('Received file message with URL:', receivedMsg.fileUrl);
              }

              // Handle the new message format and update the conversations
              if (receivedMsg && receivedMsg.conversationId) {
                // Kiểm tra xem tin nhắn này có phải do chính người dùng hiện tại gửi không
                const isFromCurrentUser = receivedMsg.senderId === userId || receivedMsg.fromId === userId;

                // Nếu tin nhắn do chính người dùng hiện tại gửi, không cần xử lý lại
                // vì đã được thêm vào danh sách tin nhắn khi gửi đi
                if (isFromCurrentUser) {
                  console.log("Skipping own message received from WebSocket");
                  return;
                }

                // First update the apiConversations state
                setApiConversations(prevConversations => {
                  // Create a new array with the updated conversation
                  return prevConversations.map(conv => {
                    if (conv.id === receivedMsg.conversationId) {
                      // Check if message already exists to prevent duplicates
                      const messageExists = conv.messages?.some(msg => msg.id === receivedMsg.id);
                      if (messageExists) {
                        return conv; // Don't add duplicate message
                      }

                      // Check if there's a temporary message with the same content that needs to be replaced
                      const tempMessageIndex = conv.messages?.findIndex(msg => {
                        if (msg.status !== 'sending') return false;

                        // For image messages, match by messageType and imageUrl if available
                        if (msg.messageType === 'image' && receivedMsg.messageType === 'image') {
                          return msg.imageUrl === receivedMsg.imageUrl;
                        }

                        // For file messages, match by messageType and fileUrl if available
                        if (msg.messageType === 'file' && receivedMsg.messageType === 'file') {
                          return msg.fileUrl === receivedMsg.fileUrl;
                        }

                        // For regular text messages, match by content
                        return msg.content === receivedMsg.content;
                      });

                      let updatedMessages;
                      if (tempMessageIndex !== -1 && tempMessageIndex !== undefined) {
                        // Replace the temporary message with the real one
                        updatedMessages = [...(conv.messages || [])];

                        // Preserve the imageUrl or fileUrl from the temporary message if not in the received message
                        if (updatedMessages[tempMessageIndex].messageType === 'image' &&
                          updatedMessages[tempMessageIndex].imageUrl &&
                          !receivedMsg.imageUrl) {
                          receivedMsg.imageUrl = updatedMessages[tempMessageIndex].imageUrl;
                        } else if (updatedMessages[tempMessageIndex].messageType === 'file' &&
                          updatedMessages[tempMessageIndex].fileUrl &&
                          !receivedMsg.fileUrl) {
                          receivedMsg.fileUrl = updatedMessages[tempMessageIndex].fileUrl;
                          receivedMsg.fileName = updatedMessages[tempMessageIndex].fileName;
                          receivedMsg.fileSize = updatedMessages[tempMessageIndex].fileSize;
                          receivedMsg.fileType = updatedMessages[tempMessageIndex].fileType;
                        }

                        updatedMessages[tempMessageIndex] = receivedMsg;
                      } else {
                        // Just add the new message
                        updatedMessages = [...(conv.messages || []), receivedMsg];
                      }

                      // Add the new message to this conversation
                      return {
                        ...conv,
                        messages: updatedMessages
                      };
                    }
                    return conv;
                  });
                });

                // Then update selectedConversation if it matches the conversation ID
                if (selectedConversation && selectedConversation.id === receivedMsg.conversationId) {
                  setSelectedConversation(prevSelected => {
                    if (!prevSelected) return null;

                    // Check if message already exists to prevent duplicates
                    const messageExists = prevSelected.messages?.some(msg => msg.id === receivedMsg.id);
                    if (messageExists) {
                      return prevSelected; // Don't add duplicate message
                    }

                    // Check if there's a temporary message with the same content that needs to be replaced
                    const tempMessageIndex = prevSelected.messages?.findIndex(msg => {
                      if (msg.status !== 'sending') return false;

                      // For image messages, match by messageType and imageUrl if available
                      if (msg.messageType === 'image' && receivedMsg.messageType === 'image') {
                        return msg.imageUrl === receivedMsg.imageUrl;
                      }

                      // For file messages, match by messageType and fileUrl if available
                      if (msg.messageType === 'file' && receivedMsg.messageType === 'file') {
                        return msg.fileUrl === receivedMsg.fileUrl;
                      }

                      // For regular text messages, match by content
                      return msg.content === receivedMsg.content;
                    });

                    let updatedMessages;
                    if (tempMessageIndex !== -1 && tempMessageIndex !== undefined) {
                      // Replace the temporary message with the real one
                      updatedMessages = [...(prevSelected.messages || [])];

                      // Preserve the imageUrl or fileUrl from the temporary message if not in the received message
                      if (updatedMessages[tempMessageIndex].messageType === 'image' &&
                        updatedMessages[tempMessageIndex].imageUrl &&
                        !receivedMsg.imageUrl) {
                        receivedMsg.imageUrl = updatedMessages[tempMessageIndex].imageUrl;
                      } else if (updatedMessages[tempMessageIndex].messageType === 'file' &&
                        updatedMessages[tempMessageIndex].fileUrl &&
                        !receivedMsg.fileUrl) {
                        receivedMsg.fileUrl = updatedMessages[tempMessageIndex].fileUrl;
                        receivedMsg.fileName = updatedMessages[tempMessageIndex].fileName;
                        receivedMsg.fileSize = updatedMessages[tempMessageIndex].fileSize;
                        receivedMsg.fileType = updatedMessages[tempMessageIndex].fileType;
                      }

                      updatedMessages[tempMessageIndex] = receivedMsg;
                    } else {
                      // Just add the new message
                      updatedMessages = [...(prevSelected.messages || []), receivedMsg];
                    }

                    // Add the new message to the selected conversation
                    return {
                      ...prevSelected,
                      messages: updatedMessages
                    };
                  });

                  // Force a re-render by incrementing the counter
                  setMessageUpdateCounter(prev => prev + 1);

                  // Scroll to bottom after new message is added
                  setTimeout(() => {
                    const messageContainer = document.querySelector('.message-container');
                    if (messageContainer) {
                      messageContainer.scrollTop = messageContainer.scrollHeight;
                    }
                  }, 100);
                }

                // Update lastMessage in contacts when receiving new message
                setContacts(prevContacts => {
                  return prevContacts.map(contact => {
                    if (contact.id === receivedMsg.conversationId.toString()) {
                      // Nếu tin nhắn không phải từ người dùng hiện tại và không phải là contact đang được chọn
                      // thì tăng unreadCount
                      const isSelectedContact = selectedContact && selectedContact.id === contact.id;

                      // Kiểm tra xem tin nhắn này đã được xử lý chưa để tránh tăng unreadCount hai lần
                      const messageAlreadyExists = apiConversations.some(conv =>
                        conv.id === receivedMsg.conversationId &&
                        conv.messages &&
                        conv.messages.some(msg => msg.id === receivedMsg.id)
                      );

                      // Chỉ tăng unreadCount nếu tin nhắn mới, không phải từ người dùng hiện tại và không phải là contact đang được chọn
                      const shouldIncreaseUnreadCount = !messageAlreadyExists && !isFromCurrentUser && !isSelectedContact;

                      return {
                        ...contact,
                        lastMessage: receivedMsg,
                        lastMessageTimestamp: receivedMsg.timestamp,
                        unreadCount: shouldIncreaseUnreadCount ? contact.unreadCount + 1 : contact.unreadCount
                      };
                    }
                    return contact;
                  });
                });
              }
            } catch (error) {
              console.error('Error processing received message:', error);
            }
          });

          // Also subscribe to online status updates for other users
          client!.subscribe('/topic/online-users', (message) => {
            console.log("Received online status update:", message.body);
            // You can implement handling of other users' online status if needed
          });
          client!.subscribe('/topic/status', function (message) {
            const status = JSON.parse(message.body);
            if (status.online) {
              setContacts(prevContacts => prevContacts.map(contact => {
                if (contact.receivedEmail === status.username) {
                  return {
                    ...contact,
                    status: 'online'
                  };
                }
                return contact;
              }));
            } else {
              setContacts(prevContacts => prevContacts.map(contact => {
                if (contact.receivedEmail === status.username) {
                  return {
                    ...contact,
                    status: 'offline'
                  };
                }
                return contact;
              }));
            }
          });
        }
      };

      client.onStompError = (frame) => {
        console.error('STOMP error:', frame);
      };

      client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('offline');
        // Will automatically try to reconnect
      };

      client.onWebSocketClose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('offline');
        // Will automatically try to reconnect
      };

      client.activate();
      setStompClient(client);
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (client && client.connected) {
        console.log("Disconnecting WebSocket");
        client.deactivate();
      }
    };
  }, []);

  // Fetch initial conversations
  useEffect(() => {
    fetchConversations();
  }, []);
  // Add an effect to update selectedConversation when apiConversations changes
  useEffect(() => {
    if (selectedConversation && apiConversations.length > 0) {
      // Find the updated version of the selected conversation
      const updatedConversation = apiConversations.find(conv => conv.id === selectedConversation.id);
      if (updatedConversation && JSON.stringify(updatedConversation) !== JSON.stringify(selectedConversation)) {
        // console.log("Updating selected conversation from apiConversations change");
        setSelectedConversation(updatedConversation);
      }
    }
  }, [apiConversations]);
  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };
  const sendMessage = () => {
    if (!stompClient || !stompClient.connected || !newMessage.trim() || !selectedConversation) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      antMessage.error("Không thể xác định người dùng");
      return;
    }

    // Lấy thông tin username và avatar từ localStorage
    const authData = localStorage.getItem("authData");
    let username = "Người dùng";
    let avatarUrl = "";
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        username = userData.username || userData.email || "Người dùng";
        avatarUrl = userData.avatarUrl || "";
      } catch (error) {
        console.error("Error parsing authData:", error);
      }
    }

    // Prepare message data
    const messageData = {
      content: newMessage,
      from: userId,
      conversationId: selectedConversation.id,
      // For private chat, specify receiveId
      to: selectedConversation.type === 'private'
        ? (selectedConversation.messages && selectedConversation.messages.length > 0
          ? (selectedConversation.messages[0].fromId === userId
            ? selectedConversation.messages[0].receiveId
            : selectedConversation.messages[0].fromId)
          : null)
        : null,
      type: selectedConversation.type,
      senderUsername: username,  // Thêm tên người gửi
      avatarUrl: avatarUrl       // Thêm avatar người gửi
    };

    try {
      // Create a temporary message to display immediately
      const tempMessage: Message = {
        id: Date.now(), // Temporary ID
        content: newMessage,
        fromId: userId,
        conversationId: selectedConversation.id,
        timestamp: new Date().toISOString(),
        status: 'sending',
        senderUsername: username,  // Thêm tên người gửi
        avatarUrl: avatarUrl       // Thêm avatar người gửi
      };

      // Add the temporary message to the selected conversation
      setSelectedConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), tempMessage]
        };
      });

      // ALSO update the message in apiConversations
      setApiConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            // Add the new message to this conversation
            return {
              ...conv,
              messages: [...(conv.messages || []), tempMessage]
            };
          }
          return conv;
        });
      });

      // Update lastMessage in contacts
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === selectedConversation.id.toString()) {
            return {
              ...contact,
              lastMessage: tempMessage,
              lastMessageTimestamp: tempMessage.timestamp
            };
          }
          return contact;
        });
      });

      // Force a re-render
      setMessageUpdateCounter(prev => prev + 1);

      // Scroll to bottom
      setTimeout(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 100);

      // Send message using StompClient
      if (selectedConversation.type === 'private') {
        // Send private message
        stompClient.publish({
          destination: '/app/chat.private',
          body: JSON.stringify(messageData)
        });
        console.log("Send private message:", messageData);
      } else {
        // Send group message
        stompClient.publish({
          destination: `/app/chat.group.${selectedConversation.id}`,
          body: JSON.stringify(messageData)
        });
        console.log("Send group message:", messageData);
      }

      // Clear message input field
      setNewMessage('');

    } catch (error) {
      console.error("Error sending message:", error);
      antMessage.error("Không thể gửi tin nhắn");
    }
  };

  const handleSendMessage = () => {
    sendMessage();
  };


  // // Xử lý đánh dấu tin nhắn
  // const handleToggleStarred = (id: string) => {
  //   setConversations(
  //     conversations.map((msg) => {
  //       if (msg.id === id) {
  //         return { ...msg, isStarred: !msg.isStarred };
  //       }
  //       return msg;
  //     })
  //   );
  // };

  // // Xử lý xóa tin nhắn
  // const handleDeleteMessage = (id: string) => {
  //   setConversations(conversations.filter((msg) => msg.id !== id));
  //   message.success("Đã xóa tin nhắn");
  // };


  // Xử lý chọn liên hệ/hội thoại
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);

    // Find corresponding conversation
    const conversation = apiConversations.find(c => c.id.toString() === contact.id);
    if (conversation) {
      setSelectedConversation(conversation);
    }

    // Update read status in UI - đặt unreadCount về 0
    setContacts(contacts.map(c => {
      if (c.id === contact.id) {
        return {
          ...c,
          unreadCount: 0,
          roleReceiver: contact.roleReceiver,
          roleSender: contact.roleSender,
          lastActive: contact.lastActive,
          avatarReceived: contact.avatar,
          name: contact.name,
          type: contact.type,
          status: contact.status,
        };
      }
      return c;
    }));
  };

  // Xử lý soạn tin nhắn mới
  const handleCompose = () => {
    setIsComposeVisible(true);
  };

  // Xử lý gửi tin nhắn mới từ form
  const handleSubmitCompose = () => {
    composeForm.validateFields().then(values => {
      const { recipient, messageContent } = values;

      // Tìm contact dựa trên ID
      const contact = contacts.find(c => c.id === recipient);

      if (contact && currentUserId && stompClient && stompClient.connected) {
        // Create message data
        const messageData = {
          content: messageContent,
          fromId: currentUserId,
          receiveId: parseInt(recipient),
          type: 'private'
        };

        try {
          // Create a temporary message to display immediately
          const tempMessage: Message = {
            id: Date.now(), // Temporary ID
            content: messageContent,
            fromId: currentUserId,
            receiveId: parseInt(recipient),
            timestamp: new Date().toISOString(),
            status: 'sending'
          };

          // Find the conversation for this recipient
          const targetConversation = apiConversations.find(c => c.id.toString() === recipient);

          if (targetConversation) {
            // Update apiConversations
            setApiConversations(prevConversations => {
              return prevConversations.map(conv => {
                if (conv.id.toString() === recipient) {
                  // Add the new message to this conversation
                  return {
                    ...conv,
                    messages: [...(conv.messages || []), tempMessage]
                  };
                }
                return conv;
              });
            });

            // If this is the currently selected conversation, update it too
            if (selectedConversation && selectedConversation.id.toString() === recipient) {
              setSelectedConversation(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  messages: [...(prev.messages || []), tempMessage]
                };
              });

              // Force a re-render
              setMessageUpdateCounter(prev => prev + 1);

              // Scroll to bottom
              setTimeout(() => {
                const messageContainer = document.querySelector('.message-container');
                if (messageContainer) {
                  messageContainer.scrollTop = messageContainer.scrollHeight;
                }
              }, 100);
            } else {
              // Switch to this conversation if it's not currently selected
              setSelectedContact(contact);
              setSelectedConversation(targetConversation);
            }
          }

          // Send private message using StompClient
          stompClient.publish({
            destination: '/app/chat.private',
            body: JSON.stringify(messageData)
          });

          antMessage.success('Đã gửi tin nhắn mới');
          setIsComposeVisible(false);
          composeForm.resetFields();
        } catch (error) {
          console.error("Error sending new message:", error);
          antMessage.error("Không thể gửi tin nhắn");
        }
      }
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Update the isFromCurrentUser function to work with both field names
  const isFromCurrentUser = (fromId: number | undefined, senderId: number | undefined) => {
    // Use senderId if available, otherwise use fromId
    const effectiveSenderId = senderId || fromId;
    return currentUserId === effectiveSenderId;
  };

  // Add useEffect to scroll to bottom when conversations are loaded or selectedConversation changes
  useEffect(() => {
    // Scroll to bottom of message container
    setTimeout(() => {
      const messageContainer = document.querySelector('.message-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }, [selectedConversation, filteredMessages.length]);

  // Handle image upload
  const handleImageSelect = async (file: RcFile): Promise<boolean> => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      antMessage.error('Chỉ có thể tải lên các tập tin hình ảnh!');
      return false;
    }

    // Validate file size (5MB max)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      antMessage.error('Hình ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const uploadFile: UploadFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: reader.result as string,
        originFileObj: file,
      };
      setSelectedImage(uploadFile);
    };

    return false; // Prevent default upload behavior
  };

  // Upload image to server
  const uploadImage = async (file: RcFile): Promise<string> => {
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error('Auth token not found');
      }

      // Upload to the API with POST /api/chat/image
      const response = await axios.post('http://localhost:8080/api/chat/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if the response contains the image URL
      if (response.data && response.data.data) {
        // ApiResponse format with data field
        const imageUrl = response.data.data;
        setUploadedImageUrl(imageUrl);
        return imageUrl;
      } else if (response.data && typeof response.data === 'string') {
        // Direct URL response
        setUploadedImageUrl(response.data);
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      antMessage.error('Không thể tải lên hình ảnh');
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  // Send message with image
  const sendImageMessage = async () => {
    if (!stompClient || !stompClient.connected || !selectedImage?.originFileObj || !selectedConversation) {
      return;
    }

    try {
      setUploadLoading(true);

      // Upload the image first
      const imageUrl = await uploadImage(selectedImage.originFileObj);

      const userId = getCurrentUserId();
      if (!userId) {
        antMessage.error("Không thể xác định người dùng");
        return;
      }

      // Lấy thông tin username và avatar từ localStorage
      const authData = localStorage.getItem("authData");
      let username = "Người dùng";
      let avatarUrl = "";
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          username = userData.username || userData.email || "Người dùng";
          avatarUrl = userData.avatarUrl || "";
        } catch (error) {
          console.error("Error parsing authData:", error);
        }
      }

      // Prepare message data
      const messageData = {
        content: imageUrl,  // Use the image URL as content
        from: userId,
        conversationId: selectedConversation.id,
        to: selectedConversation.type === 'private'
          ? (selectedConversation.messages && selectedConversation.messages.length > 0
            ? (selectedConversation.messages[0].fromId === userId
              ? selectedConversation.messages[0].receiveId
              : selectedConversation.messages[0].fromId)
            : null)
          : null,
        type: selectedConversation.type,
        messageType: 'image',
        imageUrl: imageUrl,  // Also include imageUrl property
        senderUsername: username,  // Thêm tên người gửi
        avatarUrl: avatarUrl       // Thêm avatar người gửi
      };

      // Create a temporary message to display immediately
      const tempMessage: Message = {
        id: Date.now(), // Temporary ID
        content: imageUrl,  // Use the image URL as content
        fromId: userId,
        conversationId: selectedConversation.id,
        timestamp: new Date().toISOString(),
        status: 'sending',
        messageType: 'image',
        imageUrl: imageUrl,  // Also include imageUrl property
        senderUsername: username,  // Thêm tên người gửi
        avatarUrl: avatarUrl       // Thêm avatar người gửi
      };

      // Add the temporary message to the selected conversation
      setSelectedConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), tempMessage]
        };
      });

      // ALSO update the message in apiConversations
      setApiConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            // Add the new message to this conversation
            return {
              ...conv,
              messages: [...(conv.messages || []), tempMessage]
            };
          }
          return conv;
        });
      });

      // Update lastMessage in contacts
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === selectedConversation.id.toString()) {
            return {
              ...contact,
              lastMessage: tempMessage,
              lastMessageTimestamp: tempMessage.timestamp
            };
          }
          return contact;
        });
      });

      // Force a re-render
      setMessageUpdateCounter(prev => prev + 1);

      // Scroll to bottom
      setTimeout(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 100);

      // Send message using StompClient
      if (selectedConversation.type === 'private') {
        stompClient.publish({
          destination: '/app/chat.private',
          body: JSON.stringify(messageData)
        });
      } else {
        stompClient.publish({
          destination: `/app/chat.group.${selectedConversation.id}`,
          body: JSON.stringify(messageData)
        });
      }

      // Reset image selection
      setSelectedImage(null);
      setUploadedImageUrl(null);

    } catch (error) {
      console.error("Error sending image message:", error);
      antMessage.error("Không thể gửi tin nhắn hình ảnh");
    } finally {
      setUploadLoading(false);
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl(null);
  };

  // Helper to get file icon based on file type
  const getFileIcon = (fileName: string, fileType?: string): React.ReactNode => {
    if (!fileName) return <FileUnknownOutlined />;

    const extension = fileName.split('.').pop()?.toLowerCase();

    if (extension === 'pdf' || fileType?.includes('pdf')) {
      return <FilePdfOutlined style={{ color: '#ff4d4f' }} />;
    } else if (['doc', 'docx'].includes(extension || '') || fileType?.includes('word')) {
      return <FileWordOutlined style={{ color: '#1890ff' }} />;
    } else if (['xls', 'xlsx', 'csv'].includes(extension || '') || fileType?.includes('excel') || fileType?.includes('spreadsheet')) {
      return <FileExcelOutlined style={{ color: '#52c41a' }} />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '') || fileType?.includes('zip') || fileType?.includes('compressed')) {
      return <FileZipOutlined style={{ color: '#faad14' }} />;
    } else {
      return <FileOutlined />;
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to check if a string is an image URL
  const isImageUrl = (url: string): boolean => {
    if (!url) return false;

    // Check if URL ends with common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowercaseUrl = url.toLowerCase();

    // Check for image hosting services
    const imageHostingPatterns = [
      'imagekit.io',
      'imgur.com',
      'cloudinary.com',
      'res.cloudinary.com',
      'i.imgur.com'
    ];

    // Check if URL ends with an image extension
    const hasImageExtension = imageExtensions.some(ext => lowercaseUrl.endsWith(ext));

    // Check if URL contains an image hosting service domain
    const hasImageHostingDomain = imageHostingPatterns.some(pattern => lowercaseUrl.includes(pattern));

    return hasImageExtension || hasImageHostingDomain;
  };

  // Helper to check if a string is a file URL
  const isFileUrl = (url: string): boolean => {
    if (!url) return false;

    // Check if URL ends with common file extensions
    const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.txt'];
    const lowercaseUrl = url.toLowerCase();

    // Check for file hosting services
    const fileHostingPatterns = [
      'drive.google.com',
      'docs.google.com',
      'dropbox.com',
      'onedrive.live.com',
      'mediafire.com'
    ];

    // Check if URL ends with a file extension
    const hasFileExtension = fileExtensions.some(ext => lowercaseUrl.endsWith(ext));

    // Check if URL contains a file hosting service domain
    const hasFileHostingDomain = fileHostingPatterns.some(pattern => lowercaseUrl.includes(pattern));

    return hasFileExtension || hasFileHostingDomain;
  };

  const getFileNameFromUrl = (encodedUrl: string): string => {
    if (!encodedUrl) return 'Tập tin';

    let decodedUrl = '';
    try {
      decodedUrl = decodeURIComponent(encodedUrl); // Bước 1: Giải mã
    } catch (e) {
      decodedUrl = encodedUrl; // Nếu lỗi thì giữ nguyên
    }

    // Bước 2: Tách phần cuối cùng (sau dấu '/')
    const parts = decodedUrl.split('/');
    let fileName = parts[parts.length - 1];

    // Bước 3: Xoá tiền tố imagesChat123456789_
    const pattern = /^imagesChat\d+_(.+)$/;
    const match = fileName.match(pattern);
    if (match && match[1]) {
      fileName = match[1];
    }

    return fileName || 'Tập tin';
  };


  // Handle file select
  const handleFileSelect = async (file: RcFile): Promise<boolean> => {
    // Validate file size (20MB max)
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      antMessage.error('Tập tin phải nhỏ hơn 20MB!');
      return false;
    }

    // Create an UploadFile object
    const uploadFile: UploadFile = {
      uid: file.uid,
      name: file.name,
      status: 'done',
      size: file.size,
      type: file.type,
      originFileObj: file,
    };

    setSelectedFile(uploadFile);
    return false; // Prevent default upload behavior
  };

  // Upload file to server
  const uploadFile = async (file: RcFile): Promise<string> => {
    setUploadLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error('Auth token not found');
      }

      // Upload to the API with progress tracking
      const response = await axios.post('http://localhost:8080/api/chat/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      // Check if the response contains the file URL
      if (response.data && response.data.data) {
        // ApiResponse format with data field
        const fileUrl = response.data.data;
        setUploadedFileUrl(fileUrl);
        return fileUrl;
      } else if (response.data && typeof response.data === 'string') {
        // Direct URL response
        setUploadedFileUrl(response.data);
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      antMessage.error('Không thể tải lên tập tin');
      throw error;
    } finally {
      setUploadLoading(false);
      setUploadProgress(100);
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadProgress(0);
  };

  // Send message with file
  const sendFileMessage = async () => {
    if (!stompClient || !stompClient.connected || !selectedFile?.originFileObj || !selectedConversation) {
      return;
    }

    try {
      setUploadLoading(true);

      // Upload the file first
      const fileUrl = await uploadFile(selectedFile.originFileObj);

      const userId = getCurrentUserId();
      if (!userId) {
        antMessage.error("Không thể xác định người dùng");
        return;
      }

      // Lấy thông tin username và avatar từ localStorage
      const authData = localStorage.getItem("authData");
      let username = "Người dùng";
      let avatarUrl = "";
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          username = userData.username || userData.email || "Người dùng";
          avatarUrl = userData.avatarUrl || "";
        } catch (error) {
          console.error("Error parsing authData:", error);
        }
      }

      // Prepare message data
      const messageData = {
        content: fileUrl,  // Use file name as content
        from: userId,
        conversationId: selectedConversation.id,
        to: selectedConversation.type === 'private'
          ? (selectedConversation.messages && selectedConversation.messages.length > 0
            ? (selectedConversation.messages[0].fromId === userId
              ? selectedConversation.messages[0].receiveId
              : selectedConversation.messages[0].fromId)
            : null)
          : null,
        type: selectedConversation.type,
        messageType: 'file',
        fileUrl: fileUrl,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        senderUsername: username,  // Thêm tên người gửi
        avatarUrl: avatarUrl       // Thêm avatar người gửi
      };

      // Create a temporary message to display immediately
      const tempMessage: Message = {
        id: Date.now(),
        content: selectedFile.name || "Tập tin",  // Use file name as content
        fromId: userId,
        conversationId: selectedConversation.id,
        timestamp: new Date().toISOString(),
        status: 'sending',
        messageType: 'file',
        fileUrl: fileUrl,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        senderUsername: username,  // Thêm tên người gửi
        avatarUrl: avatarUrl       // Thêm avatar người gửi
      };

      // Add the temporary message to the selected conversation
      setSelectedConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), tempMessage]
        };
      });

      // ALSO update the message in apiConversations
      setApiConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...(conv.messages || []), tempMessage]
            };
          }
          return conv;
        });
      });

      // Update lastMessage in contacts
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.id === selectedConversation.id.toString()) {
            return {
              ...contact,
              lastMessage: tempMessage,
              lastMessageTimestamp: tempMessage.timestamp
            };
          }
          return contact;
        });
      });

      // Force a re-render
      setMessageUpdateCounter(prev => prev + 1);

      // Scroll to bottom
      setTimeout(() => {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
          messageContainer.scrollTop = messageContainer.scrollHeight;
        }
      }, 100);

      // Send message using StompClient
      if (selectedConversation.type === 'private') {
        stompClient.publish({
          destination: '/app/chat.private',
          body: JSON.stringify(messageData)
        });
      } else {
        stompClient.publish({
          destination: `/app/chat.group.${selectedConversation.id}`,
          body: JSON.stringify(messageData)
        });
      }

      // Reset file selection
      setSelectedFile(null);
      setUploadedFileUrl(null);
      setUploadProgress(0);

    } catch (error) {
      console.error("Error sending file message:", error);
      antMessage.error("Không thể gửi tập tin");
    } finally {
      setUploadLoading(false);
    }
  };

  // Đăng ký lắng nghe các cuộc hội thoại nhóm khi apiConversations thay đổi
  useEffect(() => {
    if (stompClient && stompClient.connected && apiConversations.length > 0) {
      // Lọc ra các cuộc hội thoại nhóm
      const groupConversations = apiConversations.filter(conv => conv.type === 'group');

      // Đăng ký lắng nghe cho từng cuộc hội thoại nhóm
      groupConversations.forEach(conversation => {
        const conversationId = conversation.id;
        console.log(`Subscribing to group conversation: ${conversationId}`);

        // Đăng ký lắng nghe tin nhắn từ nhóm
        stompClient.subscribe(`/topic/conversation/${conversationId}`, (message) => {
          try {
            console.log(`Received message from group ${conversationId}:`, message.body);
            const receivedMsg = JSON.parse(message.body);

            // Xử lý tin nhắn nhóm tương tự như tin nhắn cá nhân
            if (receivedMsg && receivedMsg.conversationId) {
              // Kiểm tra xem tin nhắn này có phải do chính người dùng hiện tại gửi không
              const isFromCurrentUser = receivedMsg.senderId === currentUserId || receivedMsg.fromId === currentUserId;

              // Nếu tin nhắn do chính người dùng hiện tại gửi, không cần xử lý lại
              // vì đã được thêm vào danh sách tin nhắn khi gửi đi
              if (isFromCurrentUser) {
                console.log("Skipping own message received from WebSocket");
                return;
              }

              // First update the apiConversations state
              setApiConversations(prevConversations => {
                // Create a new array with the updated conversation
                return prevConversations.map(conv => {
                  if (conv.id === receivedMsg.conversationId) {
                    // Check if message already exists to prevent duplicates
                    const messageExists = conv.messages?.some(msg => msg.id === receivedMsg.id);
                    if (messageExists) {
                      return conv; // Don't add duplicate message
                    }

                    // Add the new message to this conversation
                    return {
                      ...conv,
                      messages: [...(conv.messages || []), receivedMsg]
                    };
                  }
                  return conv;
                });
              });

              // Then update selectedConversation if it matches the conversation ID
              if (selectedConversation && selectedConversation.id === receivedMsg.conversationId) {
                setSelectedConversation(prevSelected => {
                  if (!prevSelected) return null;

                  // Check if message already exists to prevent duplicates
                  const messageExists = prevSelected.messages?.some(msg => msg.id === receivedMsg.id);
                  if (messageExists) {
                    return prevSelected; // Don't add duplicate message
                  }

                  // Add the new message to the selected conversation
                  return {
                    ...prevSelected,
                    messages: [...(prevSelected.messages || []), receivedMsg]
                  };
                });

                // Force a re-render by incrementing the counter
                setMessageUpdateCounter(prev => prev + 1);

                // Scroll to bottom after new message is added
                setTimeout(() => {
                  const messageContainer = document.querySelector('.message-container');
                  if (messageContainer) {
                    messageContainer.scrollTop = messageContainer.scrollHeight;
                  }
                }, 100);
              }

              // Update lastMessage in contacts when receiving new message
              setContacts(prevContacts => {
                return prevContacts.map(contact => {
                  if (contact.id === receivedMsg.conversationId.toString()) {
                    // Nếu tin nhắn không phải từ người dùng hiện tại và không phải là contact đang được chọn
                    // thì tăng unreadCount
                    const isSelectedContact = selectedContact && selectedContact.id === contact.id;

                    // Kiểm tra xem tin nhắn này đã được xử lý chưa để tránh tăng unreadCount hai lần
                    const messageAlreadyExists = apiConversations.some(conv =>
                      conv.id === receivedMsg.conversationId &&
                      conv.messages &&
                      conv.messages.some(msg => msg.id === receivedMsg.id)
                    );

                    // Chỉ tăng unreadCount nếu tin nhắn mới, không phải từ người dùng hiện tại và không phải là contact đang được chọn
                    const shouldIncreaseUnreadCount = !messageAlreadyExists && !isFromCurrentUser && !isSelectedContact;

                    return {
                      ...contact,
                      lastMessage: receivedMsg,
                      lastMessageTimestamp: receivedMsg.timestamp,
                      unreadCount: shouldIncreaseUnreadCount ? contact.unreadCount + 1 : contact.unreadCount
                    };
                  }
                  return contact;
                });
              });
            }
          } catch (error) {
            console.error(`Error processing message from group ${conversationId}:`, error);
          }
        });
      });
    }
  }, [stompClient, apiConversations, currentUserId, selectedContact, selectedConversation]);

  return (
    <div>
      <Title level={2}>
        Tin nhắn
        {/* <Badge
          status={connectionStatus === 'online' ? "success" : "error"}
          text={connectionStatus === 'online' ? "Kết nối" : "Mất kết nối"}
          style={{ fontSize: '14px', marginLeft: '10px' }}
        /> */}
      </Title>

      <Layout style={{ background: '#fff', padding: '24px 0', minHeight: 'calc(100vh - 200px)' }}>
        <Sider width={320} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '0 16px', marginBottom: 16 }}>
            {/* <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleCompose}
              block
              style={{ marginBottom: 16 }}
            >
              Soạn tin nhắn
            </Button> */}

            <Search
              placeholder="Tìm liên hệ..."
              onSearch={handleSearch}
              style={{ marginBottom: 16 }}
            />

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ marginBottom: 16 }}
              type="card"
              items={[
                {
                  key: 'private',
                  label: <span><UserOutlined /> Cá nhân</span>,
                },
                {
                  key: 'group',
                  label: <span><TeamOutlined /> Nhóm</span>,
                }
              ]}
            />
          </div>

          <Divider style={{ margin: '0 0 16px 0' }} />

          <List
            loading={loading}
            dataSource={filteredContacts}
            locale={{ emptyText: activeTab === 'private' ? 'Không có cuộc trò chuyện cá nhân' : 'Không có cuộc trò chuyện nhóm' }}
            renderItem={contact => (
              <List.Item
                onClick={() => handleSelectContact(contact)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  background: selectedContact?.id === contact.id ? '#f5f5f5' : 'inherit'
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={contact.avatar}
                      icon={!contact.avatar && (contact.type === 'group' ? <TeamOutlined /> : <UserOutlined />)}
                      size="large"
                    />
                  }
                  title={
                    <Space>
                      {contact.type === 'group' ? (
                        <Text strong>{contact.name}</Text>
                      ) : (
                        <Text strong>{contact.name}</Text>
                      )}
                      <Badge
                        status={contact.status === 'online' ? 'success' : contact.status === 'busy' ? 'warning' : 'default'}
                      />
                      {contact.unreadCount > 0 && (
                        <BellOutlined style={{ color: '#ff4d4f' }} />
                      )}
                    </Space>
                  }
                  description={
                    <>
                      {contact.lastMessage && (
                        <div style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                          fontWeight: contact.unreadCount > 0 ? 'bold' : 'normal'
                        }}>
                          {contact.lastMessage.messageType === 'image' ? (
                            <Space>
                              <PictureOutlined />
                              <span>Hình ảnh</span>
                            </Space>
                          ) : contact.lastMessage.messageType === 'file' ? (
                            <Space>
                              <FileOutlined />
                              <span>Tập tin: {contact.lastMessage.fileName || 'Tập tin'}</span>
                            </Space>
                          ) : (
                            contact.lastMessage.content
                          )}
                        </div>
                      )}
                      <div>
                        {contact.type === 'group'
                          ? 'Nhóm trò chuyện'
                          : (contact.status === 'offline' && contact.lastActive
                            ? `Hoạt động ${new Date(contact.lastActive).toLocaleDateString('vi-VN')}`
                            : contact.status === 'online'
                              ? 'Đang hoạt động'
                              : 'Đang bận')}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          {selectedContact && selectedConversation ? (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <Space>
                  <Avatar
                    src={selectedContact.avatar}
                    icon={!selectedContact.avatar && <UserOutlined />}
                    size="large"
                  />
                  <div>
                    {selectedConversation.type === 'group' ? (
                      <Text strong style={{ fontSize: 16 }}>{selectedConversation.name}</Text>
                    ) : (
                      <Text strong style={{ fontSize: 16 }}>{selectedConversation.receivedName}</Text>
                    )}
                    <div>
                      <Badge
                        status={selectedContact.status === 'online' ? 'success' : 'default'}
                        text={selectedConversation.type === 'group' ? 'Nhóm' : 'Trò chuyện riêng'}
                      />
                    </div>
                  </div>
                </Space>

                <Space>
                  <Tooltip title="Tìm kiếm trong cuộc trò chuyện">
                    <Button icon={<SearchOutlined />} />
                  </Tooltip>
                  <Tooltip title="Thêm tùy chọn">
                    <Button icon={<MoreOutlined />} />
                  </Tooltip>
                </Space>
              </div>

              <div
                className="message-container"
                style={{
                  height: 'calc(100vh - 380px)',
                  overflowY: 'auto',
                  padding: '16px 0',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {filteredMessages.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={filteredMessages}
                    renderItem={msg => {
                      // Updated to use both fields
                      const isCurrentUser = isFromCurrentUser(msg.fromId, msg.senderId);

                      return (
                        <List.Item
                          style={{
                            textAlign: isCurrentUser ? 'right' : 'left',
                            padding: '8px 0'
                          }}
                          key={msg.id}
                        >
                          <div style={{
                            display: 'flex',
                            flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                            alignItems: 'flex-start',
                            gap: 16
                          }}>
                            {!isCurrentUser && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                  icon={<UserOutlined />}
                                  src={msg.fromImage}
                                  size="large"
                                />
                                {selectedConversation?.type === 'group' && (
                                  <div style={{
                                    fontSize: '10px',
                                    marginTop: '4px',
                                    maxWidth: '60px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center'
                                  }}>
                                    {msg.senderUsername?.split(' ').pop() || 'User'}
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{
                              maxWidth: '70%',
                              background: isCurrentUser ? '#1890ff' : '#f5f5f5',
                              color: isCurrentUser ? 'white' : 'inherit',
                              padding: '12px 16px',
                              borderRadius: '12px',
                              display: 'inline-block',
                              textAlign: 'left'
                            }}>
                              {/* Hiển thị tên người gửi trong nhóm chat */}
                              {selectedConversation?.type === 'group' && !isCurrentUser && (
                                <div style={{
                                  fontWeight: 'bold',
                                  marginBottom: 4,
                                  color: isCurrentUser ? 'white' : '#1890ff'
                                }}>
                                  {msg.senderUsername || 'Người dùng'}
                                </div>
                              )}

                              {/* Show different content based on message type */}
                              {msg.messageType === 'image' && msg.imageUrl ? (
                                <div style={{ marginBottom: '8px' }}>
                                  <Image
                                    src={msg.content}
                                    alt="Image"
                                    style={{ maxWidth: '100%', borderRadius: '6px' }}
                                    preview={{
                                      mask: <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                      }}>
                                        <SearchOutlined style={{ marginRight: '5px' }} /> Xem
                                      </div>
                                    }}
                                  />
                                </div>
                              ) : msg.messageType === 'file' && msg.fileUrl ? (
                                <div style={{
                                  border: '1px solid ' + (isCurrentUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'),
                                  borderRadius: '6px',
                                  padding: '8px',
                                  marginBottom: '8px',
                                  cursor: 'pointer'
                                }}
                                  onClick={() => window.open(msg.fileUrl, '_blank')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {getFileIcon(msg.fileName || '', msg.fileType)}
                                    <div style={{ marginLeft: '8px', overflow: 'hidden' }}>
                                      <div style={{
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '200px'
                                      }}>
                                        {msg.fileName || 'Tập tin'}
                                      </div>
                                      {msg.fileSize && (
                                        <div style={{
                                          fontSize: '11px',
                                          color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)'
                                        }}>
                                          {formatFileSize(msg.fileSize)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                    <DownloadOutlined style={{ marginRight: '5px', color: isCurrentUser ? 'rgba(255,255,255,0.85)' : undefined }} />
                                    <span style={{
                                      fontSize: '12px',
                                      color: isCurrentUser ? 'rgba(255,255,255,0.85)' : undefined
                                    }}>
                                      Tải xuống
                                    </span>
                                  </div>
                                </div>
                              ) : isImageUrl(msg.content) ? (
                                <div style={{ marginBottom: '8px' }}>
                                  <Image
                                    src={msg.content}
                                    alt="Image"
                                    style={{ maxWidth: '100%', borderRadius: '6px' }}
                                    preview={{
                                      mask: <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                      }}>
                                        <SearchOutlined style={{ marginRight: '5px' }} /> Xem
                                      </div>
                                    }}
                                  />
                                </div>
                              ) : isFileUrl(msg.content) ? (
                                <div style={{
                                  border: '1px solid ' + (isCurrentUser ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'),
                                  borderRadius: '6px',
                                  padding: '8px',
                                  marginBottom: '8px',
                                  cursor: 'pointer'
                                }}
                                  onClick={() => window.open(msg.content, '_blank')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {getFileIcon(getFileNameFromUrl(msg.content), '')}
                                    <div style={{ marginLeft: '8px', overflow: 'hidden' }}>
                                      <div style={{
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '200px'
                                      }}>
                                        {getFileNameFromUrl(msg.content)}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                    <DownloadOutlined style={{ marginRight: '5px', color: isCurrentUser ? 'rgba(255,255,255,0.85)' : undefined }} />
                                    <span style={{
                                      fontSize: '12px',
                                      color: isCurrentUser ? 'rgba(255,255,255,0.85)' : undefined
                                    }}>
                                      Tải xuống
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <Paragraph style={{ margin: 0 }}>
                                  {msg.content}
                                </Paragraph>
                              )}
                              <div style={{
                                fontSize: '11px',
                                marginTop: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)'
                              }}>
                                <span>{formatDate(msg.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                ) : (
                  <Empty description="Không có tin nhắn" />
                )}
              </div>

              <div style={{
                borderTop: '1px solid #f0f0f0',
                padding: '16px 0'
              }}>
                {/* Display selected image preview */}
                {selectedImage && (
                  <div style={{
                    marginBottom: 16,
                    border: '1px solid #f0f0f0',
                    padding: 16,
                    borderRadius: 4,
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>Hình ảnh đã chọn</Text>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={removeSelectedImage}
                        size="small"
                      />
                    </div>
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                      <img
                        src={selectedImage.url || ''}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                      {uploadLoading && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#fff' }} spin />} />
                        </div>
                      )}
                    </div>
                    <Button
                      type="primary"
                      block
                      onClick={sendImageMessage}
                      style={{ marginTop: 8 }}
                      loading={uploadLoading}
                    >
                      Gửi hình ảnh
                    </Button>
                  </div>
                )}

                {/* Display selected file */}
                {selectedFile && (
                  <div style={{
                    marginBottom: 16,
                    border: '1px solid #f0f0f0',
                    padding: 16,
                    borderRadius: 4,
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text strong>Tập tin đã chọn</Text>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={removeSelectedFile}
                        size="small"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                      {getFileIcon(selectedFile.name || '', selectedFile.type)}
                      <div style={{ marginLeft: 16, flexGrow: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{selectedFile.name}</div>
                        <div style={{ color: '#888', fontSize: '12px' }}>
                          {selectedFile.size && formatFileSize(selectedFile.size)}
                        </div>
                      </div>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <Progress percent={uploadProgress} size="small" status="active" />
                    )}
                    <Button
                      type="primary"
                      block
                      onClick={sendFileMessage}
                      style={{ marginTop: 8 }}
                      loading={uploadLoading}
                    >
                      Gửi tập tin
                    </Button>
                  </div>
                )}

                <Input.TextArea
                  rows={3}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{ marginBottom: 16 }}
                  onKeyDown={e => {
                    // Send message when pressing Enter (without Shift)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        handleSendMessage();
                      }
                    }
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Upload
                      beforeUpload={handleImageSelect}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Tooltip title="Gửi hình ảnh">
                        <Button icon={<PictureOutlined />} />
                      </Tooltip>
                    </Upload>
                    <Upload
                      beforeUpload={handleFileSelect}
                      showUploadList={false}
                    >
                      <Tooltip title="Gửi tập tin">
                        <Button icon={<PaperClipOutlined />} />
                      </Tooltip>
                    </Upload>
                  </Space>

                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Empty description="Chọn một liên hệ để bắt đầu trò chuyện" />
          )}
        </Content>
      </Layout>

      {/* Modal soạn tin nhắn mới */}
      <Modal
        title="Soạn tin nhắn mới"
        open={isComposeVisible}
        onCancel={() => setIsComposeVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsComposeVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitCompose}
          >
            Gửi
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={composeForm}
          layout="vertical"
        >
          <Form.Item
            name="recipient"
            label="Người nhận"
            rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}
          >
            <Select placeholder="Chọn người nhận">
              {contacts.map(contact => (
                <Select.Option key={contact.id} value={contact.id}>
                  {contact.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Tiêu đề"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="messageContent"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung tin nhắn' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="attachment"
            label="Đính kèm tệp"
          >
            <Button icon={<PaperClipOutlined />}>Chọn tệp</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;
