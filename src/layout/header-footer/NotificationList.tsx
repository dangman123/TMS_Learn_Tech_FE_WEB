import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import "./NotificationList.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  topic: string;
  createdAt: string;
  status: boolean;
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
    useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState("important");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
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

        const data = await response.json();
        console.log("Notifications data received:", data);

        // Handle paginated response format
        if (data && typeof data === 'object' && data.content && Array.isArray(data.content)) {
          setNotifications(data.content);
          setUnreadCount(
            data.content.filter((notification: Notification) => !notification.status).length
          );
        } else if (Array.isArray(data)) {
          // Direct array response
          setNotifications(data);
          setUnreadCount(
            data.filter((notification: Notification) => !notification.status).length
          );
        } else {
          // Unexpected format, set empty array
          console.error("Unexpected notification data format:", data);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // Close popup when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettingsPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setVisibleCount(5); // Reset số lượng hiển thị khi chuyển tab
  };

  // Updated function to filter notifications based on topic
  const getFilteredNotifications = () => {
    if (!Array.isArray(notifications)) {
      return [];
    }
    
    if (activeTab === "important") {
      return notifications.filter(notification => 
        notification.topic !== "SYSTEM" && 
        notification.topic !== "GENERAL"
      );
    } else if (activeTab === "system") {
      return notifications.filter(notification => 
        notification.topic === "SYSTEM" || 
        notification.topic === "GENERAL"
      );
    }
    
    return [];
  };

  const getUnreadCount = (tab: string) => {
    // Ensure notifications is an array
    if (!Array.isArray(notifications)) {
      console.error("notifications is not an array:", notifications);
      return 0;
    }

    if (tab === "important") {
      return notifications.filter(
        (notification) =>
          notification.topic !== "SYSTEM" &&
          notification.topic !== "GENERAL" &&
          !notification.status
      ).length;
    } else if (tab === "system") {
      return notifications.filter(
        (notification) =>
          (notification.topic === "SYSTEM" || 
           notification.topic === "GENERAL") &&
          !notification.status
      ).length;
    }
    
    return 0;
  };

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);

  const handleNotificationClick = async (notification: Notification) => {
    setDetailLoading(true);
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

      // Fetch detailed notification
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/detail/${notification.id}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notification details");
      }

      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        setSelectedNotification(result.data);
      } else {
        // Fallback to the list item if detailed fetch fails
        setSelectedNotification(notification);
      }
      
      // Mark as read if not already
      if (!notification.status) {
        markAsRead(getUserData().id, notification.id);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? { ...notif, status: true }
              : notif
          )
        );
        setUnreadCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error fetching notification details:", error);
      setSelectedNotification(notification);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleExpand = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedItems(
      expandedItems.includes(id)
        ? expandedItems.filter((itemId) => itemId !== id)
        : [...expandedItems, id]
    );
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

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          readStatus: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };

  const markAsRead = async (userId: number, notificationId: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token) || !token) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return false;
        }
        localStorage.setItem("authToken", token);
      }

      // Using the new API endpoint format from the provided code
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  const toggleSettingsMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSettings(!showSettings);
  };

  const openSettingsPopup = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSettingsPopup(true);
  };

  const closeSettingsPopup = () => {
    setShowSettingsPopup(false);
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token) || !token) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return false;
        }
        localStorage.setItem("authToken", token);
      }

      // Using the direct notification ID in the endpoint
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/${notificationId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      // Cập nhật danh sách thông báo sau khi xóa
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );

      // Cập nhật số lượng thông báo chưa đọc nếu cần
      setUnreadCount(
        notifications.filter(
          (notification) =>
            notification.id !== notificationId &&
            !notification.status
        ).length
      );
      
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatMessage = (message: string, isExpanded: boolean): string => {
    // Handle null or undefined message
    if (!message) return "";
    if (isExpanded || message.length <= 200) return message;
    return `${message.substring(0, 198)}...`;
  };

  // Helper function to get topic display name
  const getTopicDisplayName = (topic: string): string => {
    const topicMap: {[key: string]: string} = {
      'LEARNING': 'Học tập',
      'SYSTEM': 'Hệ thống',
      'IMPORTANT': 'Quan trọng',
      'GENERAL': 'Hệ thống'
    };
    
    return topicMap[topic] || topic;
  };

  if (loading) {
    return (
      <div className="notification-container">
        <div className="notification-details">
          <div className="notification-header">Đang tải thông báo...</div>
        </div>
      </div>
    );
  }

  // Get filtered notifications based on active tab
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="notification-container">
      <div className="notification-details">
        <h2 className="notification-header">Thông báo</h2>

        <div className="notification-actions">
          <div className="notification-tabs">
            <button
              className={`tab-button ${activeTab === "important" ? "active" : ""
                }`}
              onClick={() => handleTabChange("important")}
            >
              Quan trọng
              {getUnreadCount("important") > 0 && (
                <span className="tab-badge">{getUnreadCount("important")}</span>
              )}
            </button>
            <button
              className={`tab-button ${activeTab === "system" ? "active" : ""}`}
              onClick={() => handleTabChange("system")}
            >
              Hệ thống
              {getUnreadCount("system") > 0 && (
                <span className="tab-badge">{getUnreadCount("system")}</span>
              )}
            </button>
          </div>
          <div className="settings-container" ref={menuRef}>
            <button onClick={openSettingsPopup} className="settings-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-notification">
              <div className="empty-notification-icon">📭</div>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            filteredNotifications.slice(0, visibleCount).map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.status ? "read" : "unread"
                  }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-title">
                  {notification.title}
                  <div className="notification-actions-right">
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                </div>

                <div
                  className={`notification-message ${expandedItems.includes(notification.id)
                    ? "expanded"
                    : ""
                    }`}
                >
                  {formatMessage(
                    notification.message,
                    expandedItems.includes(notification.id)
                  )}
                </div>

                {notification.message && notification.message.length > 200 && (
                  <div
                    className="expand-icon"
                    onClick={(e) =>
                      toggleExpand(notification.id, e)
                    }
                  >
                    {expandedItems.includes(notification.id) ? (
                      <>
                        Thu gọn <span>▲</span>
                      </>
                    ) : (
                      <>
                        Xem thêm <span>▼</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {filteredNotifications.length > visibleCount && (
          <button onClick={handleShowMore} className="notification-show-more">
            Hiển thị thêm
          </button>
        )}
      </div>

      {selectedNotification && (
        <div className="notification-popup" onClick={() => closePopup()}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <div className="loading-spinner">Đang tải...</div>
            ) : (
              <div className="popup-content-notification">
                <div className="popup-header-notification">
                  <div className="popup-title">
                    {selectedNotification.title}
                  </div>
                  <div className="popup-meta">
                    <div className="popup-topic">
                      <span className="topic-label">Phân loại:</span> 
                      <span className="topic-value">{getTopicDisplayName(selectedNotification.topic)}</span>
                    </div>
                    <div className="popup-date">
                      <span className="date-label">Thời gian:</span>
                      <span className="date-value">{formatDate(selectedNotification.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="popup-bottom-notification">
                  <p className="notification-message-detail">{selectedNotification.message}</p>
                </div>
                {selectedNotification.status !== undefined && (
                  <div className="notification-status">
                    <span className="status-indicator"></span>
                    <span className="status-text">{selectedNotification.status ? 'Đã đọc' : 'Chưa đọc'}</span>
                  </div>
                )}
              </div>
            )}
            <button onClick={closePopup} className="popup-close">
              Đóng
            </button>
          </div>
        </div>
      )}

      {showSettingsPopup && (
        <div
          className="notification-popup settings-popup"
          onClick={closeSettingsPopup}
        >
          <div
            className="popup-content settings-popup-content"
            onClick={(e) => e.stopPropagation()}
            ref={settingsRef}
          >
            <div className="popup-header">
              <div className="popup-title">Cài đặt thông báo</div>
              <button onClick={closeSettingsPopup} className="popup-close-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">Tương tác và cập nhật</h3>

              <div className="settings-option">
                <div className="settings-option-info">
                  <div className="settings-option-title">
                    Bình luận và phản hồi
                  </div>
                  <div className="settings-option-description">
                    Thông báo khi có người phản hồi bình luận hoặc bài đăng của
                    bạn
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div className="settings-option-info">
                  <div className="settings-option-title">Cập nhật khóa học</div>
                  <div className="settings-option-description">
                    Thông báo khi có nội dung mới hoặc thay đổi trong khóa học
                    của bạn
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h3 className="settings-section-title">Thành tích và ưu đãi</h3>

              <div className="settings-option">
                <div className="settings-option-info">
                  <div className="settings-option-title">
                    Thông báo thành tích
                  </div>
                  <div className="settings-option-description">
                    Thông báo khi bạn đạt được thành tích hoặc mốc học tập mới
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="settings-option">
                <div className="settings-option-info">
                  <div className="settings-option-title">
                    Khuyến mãi và ưu đãi
                  </div>
                  <div className="settings-option-description">
                    Thông báo về các ưu đãi, giảm giá và sự kiện đặc biệt
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button
                onClick={markAllAsRead}
                className="mark-all-button settings-action-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0" />
                </svg>
                Đánh dấu tất cả đã đọc
              </button>
              <button
                onClick={closeSettingsPopup}
                className="reset-defaults-button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path
                    fill-rule="evenodd"
                    d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                  />
                </svg>
                Đặt lại mặc định
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationList;