import React, { useState, useEffect } from "react";
import * as Icon from "react-bootstrap-icons";
import "./HeaderProfile.css";

const HeaderProfile: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        setUserName(parsedData.fullname || "Người dùng");
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }

    // Giả lập dữ liệu thông báo
    setNotifications([
      {
        id: 1,
        title: "Khóa học mới",
        message: "Bạn đã đăng ký khóa học thành công",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        title: "Cập nhật tài liệu",
        message: "Tài liệu của bạn đã được cập nhật",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
    ]);

    // Đếm số thông báo chưa đọc
    setUnreadCount(1);
  }, []);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // Số giây chênh lệch

    if (diff < 60) {
      return "Vừa xong";
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} phút trước`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} giờ trước`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  return (
    <div className="header-profile-wrapper">
      <div className="header-profile-content">
        <div className="header-profile-welcome">
          <h2>Xin chào, {userName}!</h2>
          <p className="header-profile-date">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="header-profile-actions">
          {/* <div className="header-profile-search">
            <input type="text" placeholder="Tìm kiếm..." />
            <button type="button">
              <Icon.Search />
            </button>
          </div>

          <div className="header-profile-notification">
            <button
              className="header-profile-notification-btn"
              onClick={toggleNotification}
            >
              <Icon.Bell />
              {unreadCount > 0 && (
                <span className="header-profile-notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="header-profile-notification-menu">
                <div className="header-profile-notification-header">
                  <h3>Thông báo</h3>
                  <button className="header-profile-mark-all-read">
                    <Icon.CheckAll />
                    <span>Đánh dấu tất cả đã đọc</span>
                  </button>
                </div>

                <div className="header-profile-notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`header-profile-notification-item ${
                        !notification.read ? "unread" : ""
                      }`}
                    >
                      <div className="header-profile-notification-icon">
                        <Icon.InfoCircle />
                      </div>
                      <div className="header-profile-notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <div className="header-profile-notification-time">
                          <Icon.Clock size={12} />
                          <span>{formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="header-profile-notification-footer">
                  <a href="/tai-khoan/thong-bao">Xem tất cả</a>
                </div>
              </div>
            )}
          </div> */}

          <div className="header-profile-user">
            {/* <div className="header-profile-user-avatar">
              <img
                // src="/assets/images/avatar-default.png"
                alt={userName}
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/avatar-default.png";
                }}
              />
            </div> */}
            <div className="header-profile-user-info">
              <span className="header-profile-user-name">{userName}</span>
              <span className="header-profile-user-role">Học viên</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderProfile;
