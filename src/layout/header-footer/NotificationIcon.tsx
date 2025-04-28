import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa"; // Sử dụng react-icons để thêm icon

interface NotificationIconProps {
    unreadCount: number;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ unreadCount }) => {
    return (
        <div className="notification-icon">
            <FaBell size={24} />
            {unreadCount > 0 && (
                <span className="notification-count">{unreadCount}</span>
            )}
        </div>
    );
};

export default NotificationIcon;
