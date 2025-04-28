import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";
interface Notification {
  notification: {
    id: number;
    title: string;
    message: string;
    topic: string;
    createdAt: string;
    updatedAt: string;
    deletedDate: string | null;
    deleted: boolean;
  };
  readStatus: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng

  const dropdownMenuStyles: React.CSSProperties = {
    width: "400px",
    maxHeight: "400px",
    overflowY: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    animation: "fadeIn 0.3s",
  };

  const notificationItemStyles: React.CSSProperties = {
    padding: "10px 20px",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s",
  };

  const unreadNotificationStyles: React.CSSProperties = {
    backgroundColor: "#e6f7ff",
    fontWeight: "bold",
  };

  const notificationDividerStyles: React.CSSProperties = {
    height: "1px",
    backgroundColor: "#ddd",
    marginTop: "10px",
    marginBottom: "10px",
  };

  const fadeInKeyframes = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  const handleFilterChange = (filterType: "all" | "unread") => {
    // setFilter(filterType);
    window.location.href = "/notification-all";
  };

  const handleDetailClick = (notification: Notification) => {
    window.location.href = `/notification-details/${notification.notification.id}`;
  };
  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((notification) => !notification.readStatus);

  return (
    <div className="notification-dropdown">
      <style>{fadeInKeyframes}</style>
      <DropdownButton
        id="notification-dropdown"
        style={{backgroundColor:"white"}}
        title={
          <div
            className="notification-icon"
            style={{ position: "relative", cursor: "pointer",backgroundColor:"white" }}
          >
            <FaBell size={24}   style={{backgroundColor:"white"}}/>
            {unreadCount > 0 && (
              <span
                className="notification-count"
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  backgroundColor: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "12px",
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
        }
        align="end"
        variant="light"
      >
        <div style={dropdownMenuStyles}>
          <Dropdown.Header>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <button
                onClick={() => handleFilterChange("all")}
                style={{
                  background: "none",
                  border: "none",
                  color: filter === "all" ? "#007bff" : "#000",
                  cursor: "pointer",
                }}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterChange("unread")}
                style={{
                  background: "none",
                  border: "none",
                  color: filter === "unread" ? "#007bff" : "#000",
                  cursor: "pointer",
                }}
              >
                Đánh dấu đã đọc
              </button>
            </div>
          </Dropdown.Header>
          {filteredNotifications.length === 0 ? (
            <Dropdown.ItemText>Không có thông báo nào</Dropdown.ItemText>
          ) : (
            filteredNotifications.map((notification) => (
              <Dropdown.Item
                key={notification.notification.id}
                onClick={() => handleDetailClick(notification)}
                style={{
                  ...notificationItemStyles,
                  ...(notification.readStatus ? {} : unreadNotificationStyles),
                }}
                className="dropdown-notification-item"
              >
                <div>{notification.notification.title}</div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#555",
                    marginTop: "5px",
                  }}
                  className="dropdown-notification-item-content"
                >
                  {notification.notification.message}
                </div>
                <div style={notificationDividerStyles}></div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </DropdownButton>
    </div>
  );
};

export default NotificationDropdown;
