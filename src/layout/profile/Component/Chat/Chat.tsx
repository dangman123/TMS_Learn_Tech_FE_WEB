import React, { useState, useEffect } from "react";
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
  message,
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
} from "antd";
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
  InboxOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import TextArea from "antd/lib/input/TextArea";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Sider, Content } = Layout;

interface MessageItem {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: string[];
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "busy";
  lastActive?: string;
  unreadCount: number;
  isTeacher: boolean;
}

const MessagesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [conversations, setConversations] = useState<MessageItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [newMessage, setNewMessage] = useState<string>("");
  const [isComposeVisible, setIsComposeVisible] = useState<boolean>(false);
  const [composeForm] = Form.useForm();

  // Giả lập dữ liệu liên hệ
  const mockContacts: Contact[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar:
        "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      status: "online",
      unreadCount: 2,
      isTeacher: false,
    },
    {
      id: "2",
      name: "Trần Thị B",
      status: "offline",
      lastActive: "2023-10-29T15:30:00",
      unreadCount: 0,
      isTeacher: false,
    },
    {
      id: "3",
      name: "Thầy Lê Văn C",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      status: "busy",
      unreadCount: 5,
      isTeacher: true,
    },
    {
      id: "4",
      name: "Cô Phạm Thị D",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
      status: "online",
      unreadCount: 0,
      isTeacher: true,
    },
    {
      id: "5",
      name: "Hoàng Văn E",
      status: "offline",
      lastActive: "2023-10-28T10:15:00",
      unreadCount: 1,
      isTeacher: false,
    },
  ];

  // Giả lập tin nhắn
  const mockMessages: MessageItem[] = [
    {
      id: "1",
      content: "Xin chào, em cần hỏi về bài tập tuần này ạ.",
      sender: {
        id: "1",
        name: "Nguyễn Văn A",
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      receiver: {
        id: "3",
        name: "Thầy Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      },
      timestamp: "2023-10-30T09:45:00",
      isRead: true,
      isStarred: false,
    },
    {
      id: "2",
      content:
        "Em cần nộp bài vào ngày mai và cần được hướng dẫn thêm về phần 3 ạ.",
      sender: {
        id: "1",
        name: "Nguyễn Văn A",
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      receiver: {
        id: "3",
        name: "Thầy Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      },
      timestamp: "2023-10-30T09:48:00",
      isRead: true,
      isStarred: false,
    },
    {
      id: "3",
      content:
        "Chào em, phần 3 em cần chú ý đến cách giải phương trình. Thầy sẽ gửi ví dụ sau.",
      sender: {
        id: "3",
        name: "Thầy Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      },
      receiver: {
        id: "1",
        name: "Nguyễn Văn A",
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      timestamp: "2023-10-30T10:02:00",
      isRead: true,
      isStarred: true,
    },
    {
      id: "4",
      content: "Đây là ví dụ về cách giải phương trình. Em xem và áp dụng nhé.",
      sender: {
        id: "3",
        name: "Thầy Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      },
      receiver: {
        id: "1",
        name: "Nguyễn Văn A",
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      timestamp: "2023-10-30T10:05:00",
      isRead: true,
      isStarred: false,
      attachments: ["example_solution.pdf"],
    },
    {
      id: "5",
      content: "Em cảm ơn thầy ạ. Em sẽ nghiên cứu và hỏi thêm nếu chưa hiểu.",
      sender: {
        id: "1",
        name: "Nguyễn Văn A",
        avatar:
          "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
      },
      receiver: {
        id: "3",
        name: "Thầy Lê Văn C",
        avatar: "https://randomuser.me/api/portraits/men/43.jpg",
      },
      timestamp: "2023-10-30T10:15:00",
      isRead: false,
      isStarred: false,
    },
  ];

  // Tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setContacts(mockContacts);
      setConversations(mockMessages);
      setLoading(false);
      // Mặc định chọn liên hệ đầu tiên
      if (mockContacts.length > 0) {
        setSelectedContact(mockContacts[0]);
      }
    }, 1000);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const newMessageItem: MessageItem = {
      id: `${conversations.length + 1}`,
      content: newMessage,
      sender: {
        id: "current_user",
        name: "Bạn",
      },
      receiver: {
        id: selectedContact.id,
        name: selectedContact.name,
        avatar: selectedContact.avatar,
      },
      timestamp: new Date().toISOString(),
      isRead: false,
      isStarred: false,
    };

    setConversations([...conversations, newMessageItem]);
    setNewMessage("");
    message.success("Đã gửi tin nhắn");
  };

  // Xử lý đánh dấu tin nhắn
  const handleToggleStarred = (id: string) => {
    setConversations(
      conversations.map((msg) => {
        if (msg.id === id) {
          return { ...msg, isStarred: !msg.isStarred };
        }
        return msg;
      })
    );
  };

  // Xử lý xóa tin nhắn
  const handleDeleteMessage = (id: string) => {
    setConversations(conversations.filter((msg) => msg.id !== id));
    message.success("Đã xóa tin nhắn");
  };

  // Xử lý chọn liên hệ
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);

    // Đánh dấu tất cả tin nhắn từ liên hệ này là đã đọc
    setConversations(
      conversations.map((msg) => {
        if (
          (msg.sender.id === contact.id || msg.receiver.id === contact.id) &&
          !msg.isRead
        ) {
          return { ...msg, isRead: true };
        }
        return msg;
      })
    );

    // Cập nhật số tin nhắn chưa đọc
    setContacts(
      contacts.map((c) => {
        if (c.id === contact.id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  };

  // Xử lý soạn tin nhắn mới
  const handleCompose = () => {
    setIsComposeVisible(true);
  };

  // Xử lý gửi tin nhắn mới từ form
  const handleSubmitCompose = () => {
    composeForm.validateFields().then((values) => {
      const { recipient, subject, messageContent } = values;

      // Tìm contact dựa trên ID
      const contact = contacts.find((c) => c.id === recipient);

      if (contact) {
        const newMessageItem: MessageItem = {
          id: `${conversations.length + 1}`,
          content: messageContent,
          sender: {
            id: "current_user",
            name: "Bạn",
          },
          receiver: {
            id: contact.id,
            name: contact.name,
            avatar: contact.avatar,
          },
          timestamp: new Date().toISOString(),
          isRead: false,
          isStarred: false,
        };

        setConversations([...conversations, newMessageItem]);
        message.success("Đã gửi tin nhắn mới");
        setIsComposeVisible(false);
        composeForm.resetFields();
      }
    });
  };

  // Lọc tin nhắn cho liên hệ đang chọn
  const filteredMessages = selectedContact
    ? conversations
        .filter(
          (msg) =>
            msg.sender.id === selectedContact.id ||
            msg.receiver.id === selectedContact.id
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
    : [];

  // Lọc liên hệ theo từ khóa tìm kiếm
  const filteredContacts = contacts.filter((contact) => {
    if (searchText) {
      return contact.name.toLowerCase().includes(searchText.toLowerCase());
    }
    return true;
  });

  return (
    <div>
      <Title level={2}>Tin nhắn</Title>

      <Layout
        style={{
          background: "#fff",
          padding: "24px 0",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <Sider
          width={320}
          theme="light"
          style={{ borderRight: "1px solid #f0f0f0" }}
        >
          <div style={{ padding: "0 16px", marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleCompose}
              block
              style={{ marginBottom: 16 }}
            >
              Soạn tin nhắn
            </Button>

            <Search
              placeholder="Tìm liên hệ..."
              onSearch={handleSearch}
              style={{ marginBottom: 16 }}
            />

            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              onClick={({ key }) => setActiveTab(key)}
              style={{ marginBottom: 16 }}
            >
              <Menu.Item key="inbox" icon={<InboxOutlined />}>
                Hộp thư đến
              </Menu.Item>
              <Menu.Item key="starred" icon={<StarOutlined />}>
                Đánh dấu sao
              </Menu.Item>
              <Menu.Item key="sent" icon={<SendOutlined />}>
                Đã gửi
              </Menu.Item>
              <Menu.Item key="drafts" icon={<FileTextOutlined />}>
                Bản nháp
              </Menu.Item>
            </Menu>
          </div>

          <Divider style={{ margin: "0 0 16px 0" }} />

          <List
            loading={loading}
            dataSource={filteredContacts}
            renderItem={(contact) => (
              <List.Item
                onClick={() => handleSelectContact(contact)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  background:
                    selectedContact?.id === contact.id ? "#f5f5f5" : "inherit",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={contact.unreadCount} size="small">
                      <Avatar
                        src={contact.avatar}
                        icon={!contact.avatar && <UserOutlined />}
                        size="large"
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{contact.name}</Text>
                      {contact.isTeacher && <Tag color="blue">Giáo viên</Tag>}
                      <Badge
                        status={
                          contact.status === "online"
                            ? "success"
                            : contact.status === "busy"
                            ? "warning"
                            : "default"
                        }
                      />
                    </Space>
                  }
                  description={
                    contact.status === "offline" && contact.lastActive
                      ? `Hoạt động ${new Date(
                          contact.lastActive
                        ).toLocaleDateString("vi-VN")}`
                      : contact.status === "online"
                      ? "Đang hoạt động"
                      : "Đang bận"
                  }
                />
              </List.Item>
            )}
          />
        </Sider>

        <Content style={{ padding: "0 24px", minHeight: 280 }}>
          {selectedContact ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Space>
                  <Avatar
                    src={selectedContact.avatar}
                    icon={!selectedContact.avatar && <UserOutlined />}
                    size="large"
                  />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {selectedContact.name}
                    </Text>
                    <div>
                      <Badge
                        status={
                          selectedContact.status === "online"
                            ? "success"
                            : selectedContact.status === "busy"
                            ? "warning"
                            : "default"
                        }
                        text={
                          selectedContact.status === "online"
                            ? "Đang hoạt động"
                            : selectedContact.status === "busy"
                            ? "Đang bận"
                            : "Không hoạt động"
                        }
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
                style={{
                  height: "calc(100vh - 380px)",
                  overflowY: "auto",
                  padding: "16px 0",
                }}
              >
                {filteredMessages.length > 0 ? (
                  <List
                    itemLayout="vertical"
                    dataSource={filteredMessages}
                    renderItem={(msg) => {
                      const isCurrentUser = msg.sender.id === "current_user";

                      return (
                        <List.Item
                          style={{
                            textAlign: isCurrentUser ? "right" : "left",
                            padding: "8px 0",
                          }}
                          actions={[
                            <Space style={{ display: "inline-flex" }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Text>
                              {!isCurrentUser && (
                                <Tooltip
                                  title={
                                    msg.isStarred
                                      ? "Bỏ đánh dấu sao"
                                      : "Đánh dấu sao"
                                  }
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={
                                      msg.isStarred ? (
                                        <StarFilled />
                                      ) : (
                                        <StarOutlined />
                                      )
                                    }
                                    onClick={() => handleToggleStarred(msg.id)}
                                  />
                                </Tooltip>
                              )}
                              <Tooltip title="Xóa tin nhắn">
                                <Popconfirm
                                  title="Bạn có chắc muốn xóa tin nhắn này?"
                                  onConfirm={() => handleDeleteMessage(msg.id)}
                                  okText="Có"
                                  cancelText="Không"
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  />
                                </Popconfirm>
                              </Tooltip>
                            </Space>,
                          ]}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: isCurrentUser
                                ? "row-reverse"
                                : "row",
                              alignItems: "flex-start",
                              gap: 16,
                            }}
                          >
                            {!isCurrentUser && (
                              <Avatar
                                src={msg.sender.avatar}
                                icon={!msg.sender.avatar && <UserOutlined />}
                              />
                            )}

                            <div
                              style={{
                                maxWidth: "70%",
                                background: isCurrentUser
                                  ? "#1890ff"
                                  : "#f5f5f5",
                                color: isCurrentUser ? "white" : "inherit",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                display: "inline-block",
                                textAlign: "left",
                              }}
                            >
                              <Paragraph style={{ margin: 0 }}>
                                {msg.content}
                              </Paragraph>

                              {msg.attachments &&
                                msg.attachments.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    {msg.attachments.map((attachment) => (
                                      <Tag
                                        icon={<PaperClipOutlined />}
                                        color="blue"
                                        key={attachment}
                                      >
                                        {attachment}
                                      </Tag>
                                    ))}
                                  </div>
                                )}
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

              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  padding: "16px 0",
                }}
              >
                <Input.TextArea
                  rows={3}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  style={{ marginBottom: 16 }}
                />

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Space>
                    <Tooltip title="Đính kèm tệp">
                      <Button icon={<PaperClipOutlined />} />
                    </Tooltip>
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
          <Button key="submit" type="primary" onClick={handleSubmitCompose}>
            Gửi
          </Button>,
        ]}
        width={600}
      >
        <Form form={composeForm} layout="vertical">
          <Form.Item
            name="recipient"
            label="Người nhận"
            rules={[{ required: true, message: "Vui lòng chọn người nhận" }]}
          >
            <Select placeholder="Chọn người nhận">
              {contacts.map((contact) => (
                <Select.Option key={contact.id} value={contact.id}>
                  {contact.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="messageContent"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung tin nhắn" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="attachment" label="Đính kèm tệp">
            <Button icon={<PaperClipOutlined />}>Chọn tệp</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;
