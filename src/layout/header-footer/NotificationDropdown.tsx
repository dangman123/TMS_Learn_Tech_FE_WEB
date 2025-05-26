import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import { Dropdown, DropdownButton } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./NotificationDropdown.css";

interface Notification {
    id: number;
    title: string;
    message: string;
    topic: string;
    createdAt: string;
    status: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications = [],
  unreadCount = 0,
}) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();

  const handleFilterChange = (filterType: "all" | "unread") => {
    window.location.href = "/notification-all";
  };

  const handleDetailClick = (notification: Notification) => {
    window.location.href = `/notification-details/${notification.id}`;
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  
  const filteredNotifications =
    filter === "all"
      ? safeNotifications
      : safeNotifications.filter((notification) => !notification.status);

  return (
    <div className="notification-dropdown">
      <DropdownButton
        id="notification-dropdown"
        className="custom-dropdown-button"
        align="end"
        variant="light"
        title={
          <div className="notification-icon">
            <FaBell size={24} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
        }
      >
        <div className="notification-dropdown-content">
          <div className="notification-header-a">
            <div className="notification-filter-buttons">
              <button
                onClick={() => handleFilterChange("all")}
                className={`filter-button ${filter === "all" ? "active" : ""}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleFilterChange("unread")}
                className={`filter-button ${
                  filter === "unread" ? "active" : ""
                }`}
              >
                Đánh dấu đã đọc
              </button>
            </div>
          </div>

          {!filteredNotifications || filteredNotifications.length === 0 ? (
            <div className="empty-notification">
              <div className="empty-icon">
                <FaBell size={24} color="#ccc" />
              </div>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            <div className="notification-list-a">
              {Array.isArray(filteredNotifications) && filteredNotifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleDetailClick(notification)}
                  className={`notification-item ${
                    !notification.status ? "unread" : ""
                  }`}
                >
                  <div className="notification-title">
                    {notification.title}
                  </div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
              <div
                className="view-more-notifications"
                onClick={() => navigate("/notification-all")}
              >
                Xem thông báo trước
              </div>
            </div>
          )}
        </div>
      </DropdownButton>
    </div>
  );
};

export default NotificationDropdown;