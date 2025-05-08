import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
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
    useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState("important");
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
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

        const data: Notification[] = await response.json();
        setNotifications(data);
        setUnreadCount(
          data.filter((notification) => !notification.readStatus).length
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
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

  const getUnreadCount = (topic: string) =>
    notifications.filter(
      (notification) =>
        notification.notification.topic === topic && !notification.readStatus
    ).length;

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.readStatus) {
      markAsRead(getUserData().id, notification.notification.id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification.id === notification.notification.id
            ? { ...notif, readStatus: true }
            : notif
        )
      );
      setUnreadCount((prev) => prev - 1);
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
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/notifications/mark-as-read/${userId}`,
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
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleMenu = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    // Đóng menu trước đó nếu có
    if (activeMenuId !== null && activeMenuId !== id) {
      setActiveMenuId(null);
    }
    // Hiển thị/đóng menu hiện tại
    setActiveMenuId(activeMenuId === id ? null : id);

    // Lấy vị trí để tính toán xem còn đủ không gian bên phải không
    setTimeout(() => {
      const menuElement = document.querySelector(
        ".notification-menu"
      ) as HTMLElement;
      if (menuElement) {
        const rect = menuElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Nếu menu vượt quá bên phải của màn hình
        if (rect.right > windowWidth) {
          menuElement.style.left = "auto";
          menuElement.style.right = "30px";
        }
      }
    }, 10);
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
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const user = getUserData();
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
        prev.filter((notif) => notif.notification.id !== notificationId)
      );

      // Cập nhật số lượng thông báo chưa đọc nếu cần
      setUnreadCount(
        notifications.filter(
          (notification) =>
            notification.notification.id !== notificationId &&
            !notification.readStatus
        ).length
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
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
    if (isExpanded || message.length <= 200) return message;
    return `${message.substring(0, 198)}...`;
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

  return (
    <div className="notification-container">
      <div className="notification-details">
        <h2 className="notification-header">Thông báo</h2>

        <div className="notification-actions">
          <div className="notification-tabs">
            <button
              className={`tab-button ${
                activeTab === "important" ? "active" : ""
              }`}
              onClick={() => handleTabChange("important")}
            >
              Quan trọng
              {getUnreadCount("important") > 0 && (
                <span className="tab-badge">{getUnreadCount("important")}</span>
              )}
            </button>
            <button
              className={`tab-button ${
                activeTab === "promotion" ? "active" : ""
              }`}
              onClick={() => handleTabChange("promotion")}
            >
              Ưu đãi
              {getUnreadCount("promotion") > 0 && (
                <span className="tab-badge">{getUnreadCount("promotion")}</span>
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
          {notifications.length === 0 ? (
            <div className="empty-notification">
              <div className="empty-notification-icon">📭</div>
              <p>Không có thông báo nào</p>
            </div>
          ) : (
            notifications.slice(0, visibleCount).map((notification) => (
              <div
                key={notification.notification.id}
                className={`notification-item ${
                  notification.readStatus ? "read" : "unread"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-title">
                  {notification.notification.title}
                  <div className="notification-actions-right">
                    <span className="notification-time">
                      {formatDate(notification.notification.createdAt)}
                    </span>
                    <div className="three-dots-container">
                      <span
                        className="three-dots-icon"
                        onClick={(e) =>
                          toggleMenu(notification.notification.id, e)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                      </span>
                      {activeMenuId === notification.notification.id && (
                        <div className="notification-menu">
                          {!notification.readStatus ? (
                            <div
                              className="menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(
                                  getUserData().id,
                                  notification.notification.id
                                );
                                setNotifications((prev) =>
                                  prev.map((notif) =>
                                    notif.notification.id ===
                                    notification.notification.id
                                      ? { ...notif, readStatus: true }
                                      : notif
                                  )
                                );
                                setUnreadCount((prev) => prev - 1);
                                setActiveMenuId(null);
                              }}
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
                              Đánh dấu đã đọc
                            </div>
                          ) : (
                            <div
                              className="menu-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Logic for marking as unread would go here
                                setActiveMenuId(null);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M2 15.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5zm8.854-9.646a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z" />
                              </svg>
                              Đánh dấu chưa đọc
                            </div>
                          )}
                          <div
                            className="menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.notification.id);
                              setActiveMenuId(null);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                              <path
                                fill-rule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                              />
                            </svg>
                            Xóa thông báo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`notification-message ${
                    expandedItems.includes(notification.notification.id)
                      ? "expanded"
                      : ""
                  }`}
                >
                  {formatMessage(
                    notification.notification.message,
                    expandedItems.includes(notification.notification.id)
                  )}
                </div>

                {notification.notification.message.length > 200 && (
                  <div
                    className="expand-icon"
                    onClick={(e) =>
                      toggleExpand(notification.notification.id, e)
                    }
                  >
                    {expandedItems.includes(notification.notification.id) ? (
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

        {notifications.length > visibleCount && (
          <button onClick={handleShowMore} className="notification-show-more">
            Hiển thị thêm
          </button>
        )}
      </div>

      {selectedNotification && (
        <div className="notification-popup" onClick={() => closePopup()}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-content-notification">
              <div className="popup-header-notification">
                <div className="popup-title">
                  {selectedNotification.notification.title}
                </div>
                <div className="popup-date">
                  {formatDate(selectedNotification.notification.createdAt)}
                </div>
              </div>
              <div className="popup-bottom-notification">
                <p>{selectedNotification.notification.message}</p>
              </div>
            </div>
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
