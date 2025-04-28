import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaComment,
  FaBook,
  FaHistory,
  FaFileAlt,
  FaMoneyBillWave,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaBars, FaTimes } from "react-icons/fa";
import "../style.css";

const MenuBarProfile = ({
  activeMenu,
  onMenuClick,
}: {
  activeMenu: string;
  onMenuClick: (menu: string) => void;
}) => {
  return (
    <div className="sidebar-sticky">
      <div className="menu-toggle-container"></div>
      <ul className="nav flex-column">
        <li className={`nav-item ${activeMenu === "profile" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/profile">
            <FaUser className="nav-icon" />
            <span className="nav-text">Thông tin cá nhân</span>
          </Link>
        </li>

        <li
          className={`nav-item ${activeMenu === "my-course" ? "active" : ""}`}
        >
          <Link className="nav-link" to="/tai-khoan/my-course">
            <FaBook className="nav-icon" />
            <span className="nav-text">Khóa học của tôi</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "ket-qua" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/ket-qua">
            <FaBook className="nav-icon" />
            <span className="nav-text">Kết quả học tập</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "history" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/history">
            <FaHistory className="nav-icon" />
            <span className="nav-text">Lịch sử làm bài</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            activeMenu === "history-document" ? "active" : ""
          }`}
        >
          <Link className="nav-link" to="/tai-khoan/history-document">
            <FaFileAlt className="nav-icon" />
            <span className="nav-text">Lịch sử tài liệu</span>
          </Link>
        </li>
        <li
          className={`nav-item ${activeMenu === "history-pay" ? "active" : ""}`}
        >
          <Link className="nav-link" to="/tai-khoan/history-pay">
            <FaMoneyBillWave className="nav-icon" />
            <span className="nav-text">Lịch sử thanh toán</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "chat" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/chat">
            <FaComment className="nav-icon" />
            <span className="nav-text">Chat</span>
          </Link>
        </li>
        <li
          className={`nav-item ${
            activeMenu === "enable-course" ? "active" : ""
          }`}
        >
          <Link className="nav-link" to="/tai-khoan/enable-course">
            <FaComment className="nav-icon" />
            <span className="nav-text">Kích hoạt khóa học</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "ranking" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/ranking">
            <FaComment className="nav-icon" />
            <span className="nav-text">Bảng xếp hạng</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "logout" ? "active" : ""}`}>
          <a
            className="nav-link"
            onClick={() => onMenuClick("logout")}
            style={{ cursor: "pointer" }}
          >
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-text">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default MenuBarProfile;
