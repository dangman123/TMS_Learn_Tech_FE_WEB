import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import topics from "../util/fucntion/topics";
import "./NotificationList.css";

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
const NotificationList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const notificationId = parseInt(id || "", 10);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const refresh = useRefreshToken();
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null); // Trạng thái popup
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token) || !token) {
          token = await refresh();
          if (!token) {
            window.location.href = "/dang-nhap";
            return;
          }
          localStorage.setItem("authToken", token);
        }

        const user = getUserData();
        const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/user/${user.id}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data: Notification[] = await response.json();
        setNotifications(data); // Cập nhật danh sách thông báo
        setUnreadCount(
          data.filter((notification) => !notification.readStatus).length // Cập nhật số lượng chưa đọc
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification); // Mở popup
    if (!notification.readStatus) {
      const notificationId = notification.notification.id;
      const user = getUserData();
      markAsRead(user.id, notification.notification.id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification.id === notificationId
            ? { ...notif, readStatus: true }
            : notif
        )
      );
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedItems(
      (prev) =>
        prev.includes(id)
          ? prev.filter((itemId) => itemId !== id) // Thu gọn
          : [...prev, id] // Mở rộng
    );
  };

  const handleShowMore = () => {
    setVisibleCount(notifications.length); // Hiển thị toàn bộ thông báo
  };

  const closePopup = () => {
    setSelectedNotification(null);
  };

  const markAllAsRead = async () => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token) || !token) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const user = getUserData();
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/mark-all-as-read/${user.id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      // Cập nhật trạng thái `checked` của tất cả thông báo ở phía client
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          readStatus: true, // Đánh dấu tất cả là đã đọc
        }))
      );

      //   setUnreadCount(0); // Đặt số lượng thông báo chưa đọc về 0
      window.location.reload();
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };
  const markAsRead = async (id: number, notificationId: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token) || !token) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/notifications/mark-as-read/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notificationId),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Cập nhật trạng thái đã đọc ở phía frontend
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification.id === id ? { ...notif, readStatus: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatMessage = (message: string, isExpanded: boolean): string => {
    if (isExpanded || message.length <= 200) return message;
    return `${message.substring(0, 198)}...`;
  };

  return (
    <div className="notification-container">
      <div className="notification-details">
        <h2 style={{ textAlign: "center" }}>Thông báo</h2>
        <div className="notification-actions">
          <button
            onClick={markAllAsRead}
            className="notification-actions-checked"
            style={{
              padding: "8px 16px",

              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-check2"
              viewBox="0 0 16 16"
            >
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
            </svg>{" "}
            Đánh dấu tất cả
          </button>
        </div>
        <div className="notification-list">
          {notifications.length === 0 ? (
            <p>Không có thông báo nào</p>
          ) : (
            notifications
              .slice(0, visibleCount) // Hiển thị dựa trên `visibleCount`
              .map((notification) => (
                <div
                  key={notification.notification.id}
                  className={`notification-item ${notification.readStatus ? "read" : "unread"
                    } ${expandedItems.includes(notification.notification.id)
                      ? "expanded"
                      : ""
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div style={{ fontWeight: 700 }}>
                    {notification.notification.title}
                  </div>

                  {formatMessage(
                    notification.notification.message,
                    expandedItems.includes(notification.notification.id)
                  )}
                  {notification.notification.message.length > 200 && (
                    <span
                      className="expand-icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpand(notification.notification.id);
                      }}
                    >
                      {expandedItems.includes(notification.notification.id)
                        ? "Thu gọn ▲"
                        : "Mở rộng ▼"}
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
        {visibleCount < notifications.length && (
          <button onClick={handleShowMore} className="notification-show-more">
            Hiển thị thêm
          </button>
        )}
      </div>

      {selectedNotification && (
        <div className="notification-popup">
          <div className="popup-content">
            <div className="popup-content-notification">
              <div className="popup-header-notification">
                <span>{selectedNotification.notification.title}</span>{" "}
                <span>
                  -{" "}
                  {new Intl.DateTimeFormat("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }).format(
                    new Date(selectedNotification.notification.createdAt)
                  )}
                </span>
              </div>
              <div className="popup-bottom-notification">
                <p>{selectedNotification.notification.message}</p>
              </div>
              <button onClick={closePopup} className="popup-close">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
