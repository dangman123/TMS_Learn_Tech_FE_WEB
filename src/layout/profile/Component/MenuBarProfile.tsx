import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  List,
  Person,
  ClockHistory,
  Book,
  CreditCard,
  FileText,
  ChatDots,
  Award,
  LightningCharge,
  Trophy,
  GraphUp,
  Star,
  BoxArrowRight,
} from "react-bootstrap-icons";
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
        <li className={`nav-item ${activeMenu === "overview" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/overview">
            <GraphUp className="nav-icon" />
            <span className="nav-text">Tổng quan</span>
          </Link>
        </li>
        <li
          className={`nav-item ${activeMenu === "my-course" ? "active" : ""}`}
        >
          <Link className="nav-link" to="/tai-khoan/my-course">
            <Book className="nav-icon" />
            <span className="nav-text">Học Tập</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "ket-qua" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/ket-qua">
            <Award className="nav-icon" />
            <span className="nav-text">Kết Quả Học Tập</span>
          </Link>
        </li>

        <li
          className={`nav-item ${activeMenu === "history-pay" ? "active" : ""}`}
        >
          <Link className="nav-link" to="/tai-khoan/history-pay">
            <CreditCard className="nav-icon" />
            <span className="nav-text">Lịch Sử Thanh Toán</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "history" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/history">
            <ClockHistory className="nav-icon" />
            <span className="nav-text">Lịch Sử Hoạt Động</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "upgrade" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/upgrade">
            <Star className="nav-icon" />
            <span className="nav-text">Nâng cấp gói</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "chat" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/chat">
            <ChatDots className="nav-icon" />
            <span className="nav-text">Chat</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "profile" ? "active" : ""}`}>
          <Link className="nav-link" to="/tai-khoan/profile">
            <Person className="nav-icon" />
            <span className="nav-text">Cài Đặt</span>
          </Link>
        </li>
        <li className={`nav-item ${activeMenu === "logout" ? "active" : ""}`}>
          <a
            className="nav-link"
            onClick={() => onMenuClick("logout")}
            style={{ cursor: "pointer" }}
          >
            <BoxArrowRight className="nav-icon" />
            <span className="nav-text">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default MenuBarProfile;
