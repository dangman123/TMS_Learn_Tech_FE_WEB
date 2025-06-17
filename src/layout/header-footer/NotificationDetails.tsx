import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import "./NotificationList.css"; // Reuse the existing CSS

// Interface for the API response
interface ApiResponse {
  status: number;
  message: string;
  data: NotificationData;
}

// Interface for the notification data
interface NotificationData {
  id: number;
  title: string;
  message: string;
  topic: string;
  createdAt: string;
  status: boolean;
}

const NotificationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  // Helper function to get topic display name
  const getTopicDisplayName = (topic: string): string => {
    const topicMap: {[key: string]: string} = {
      'LEARNING': 'Học tập',
      'SYSTEM': 'Hệ thống',
      'IMPORTANT': 'Quan trọng',
      'PROMOTION': 'Ưu đãi'
    };
    
    return topicMap[topic] || topic;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const fetchNotification = async (id: string) => {
    setLoading(true);
    setError(null);
    
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

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/detail/${id}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notification details");
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 200 && result.data) {
        setNotification(result.data);
      } else {
        throw new Error(result.message || "Failed to get notification data");
      }
    } catch (error) {
      console.error("Error fetching notification:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotification(id);
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); 
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

  if (error) {
    return (
      <div className="notification-container">
        <div className="notification-details">
          <div className="notification-header">Lỗi</div>
          <div className="notification-error">{error}</div>
          <button onClick={handleGoBack} className="back-button">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="notification-container">
        <div className="notification-details">
          <div className="notification-header">Không tìm thấy thông báo</div>
        
        </div>
      </div>
    );
  }

  return (
    <div className="notification-container">
      <div className="notification-details">
        <div className="notification-header-wrapper">
        
          <h2 className="notification-header">Chi tiết thông báo</h2>
        </div>

        <div className="notification-detail-card">
          <div className="notification-detail-header">
            <h3 className="notification-detail-title">{notification.title}</h3>
            <div className="notification-status-badge" title={notification.status ? "Đã đọc" : "Chưa đọc"}>
              {notification.status ? "Đã đọc" : "Chưa đọc"}
            </div>
          </div>

          <div className="notification-detail-meta">
            <div className="meta-item">
              <span className="meta-label">Phân loại:</span>
              <span className="meta-value">{getTopicDisplayName(notification.topic)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Thời gian:</span>
              <span className="meta-value">{formatDate(notification.createdAt)}</span>
            </div>
          </div>

          <div className="notification-detail-content">
            <p>{notification.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
