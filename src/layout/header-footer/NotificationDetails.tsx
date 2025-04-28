import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";

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

const NotificationDetails: React.FC = ({ }) => {
  const { id } = useParams<{ id: string }>();
  const refresh = useRefreshToken();
  const [notification, setNotification] = useState<Notification | null>(null);
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();


  const fetchNotification = async (id: number) => {
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

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/user/${user.id}/detail/${id}`;

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
      setNotification(data[0]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };
  useEffect(() => {
    fetchNotification(Number(id));
  }, [id]);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: "20px",
  };
  const detailsStyle: React.CSSProperties = {
    maxWidth: "800px",
    width: "100%",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
  };
  const filterButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    justifyContent: "space-between",
  };
  const filterButtonStyle = (isActive: boolean): React.CSSProperties => ({
    background: "none",
    border: "1px solid #007bff",
    color: isActive ? "#fff" : "#007bff",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
    backgroundColor: isActive ? "#007bff" : "transparent",
  });
  const checkboxContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  };
  const checkboxStyle: React.CSSProperties = {
    marginRight: "10px",
  };
  const notificationListStyle: React.CSSProperties = {
    marginTop: "20px",
  };
  const notificationItemStyle = (isUnread: boolean): React.CSSProperties => ({
    padding: "10px",
    borderBottom: "1px solid #eee",
    backgroundColor: isUnread ? "#e6f7ff" : "#fff",
    fontWeight: isUnread ? "bold" : "normal",
  });
  const notificationDetailStyle: React.CSSProperties = {
    marginTop: "20px",
    padding: "10px",
    borderTop: "1px solid #ddd",
  };

  return (
    <div style={containerStyle}>
      <div style={detailsStyle}>
        <h2 style={{ textAlign: "center" }}>Thông báo</h2>
        <div style={filterButtonsStyle}></div>
        <div style={notificationListStyle}>
          <div
            key={notification?.notification.id}
            style={notificationItemStyle(!notification?.readStatus)}
          >
            {notification?.notification.message}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetails;
