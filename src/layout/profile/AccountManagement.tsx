import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as Icon from "react-bootstrap-icons";
import "./AccountManagement.css";

import MenuBarProfile from "./Component/MenuBarProfile";
import Profile from "./Component/Profile";
import TestHistory from "./Component/TestHistory";
import MyCourse from "./Component/MyCourse";
import PayHistory from "./Component/PayHistory";
import DocumentHistory from "./Component/DocumentHistory";
import Chat from "./Component/Chat/Chat";
import ResultPage from "./Component/ComponentResultLearning/ResultPage";
import EnableCourse from "./Component/ComponentEnableCourse/EnableCourse";

import Overview from "./Component/OverView/OverView";
import HeaderProfile from "../header-footer/HeaderProfile";
import Upgrade from "./Component/UpgradeAccount/Upgrade";
import CourseResultsPage from "./Component/ComponentResultLearning/CourseResultsPage ";
import LearningResultsPage from "./Component/ComponentResultLearning/LearningResultsPage";

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const path = location.pathname.split("/")[2];
    setActiveMenu(path || "overview");
  }, [location]);

  const handleMenuClick = (menu: string) => {
    if (menu === "logout") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authData");
      window.location.href = "/dang-nhap";
    } else {
      navigate(`/tai-khoan/${menu}`);
      setShowMobileMenu(false); // Hide mobile menu after navigation
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <div className="container-fluid">
      {/* Mobile menu toggle button */}
      <div className="mobile-menu-toggle d-md-none">
        <button onClick={toggleMobileMenu} className="btn btn-primary">
          <Icon.List size={20} />
        </button>
      </div>

      <div className="row custom-main">
        <div
          className={`col-md-3 col-lg-3 d-md-block sidebar custom-nav-profile ${showMobileMenu ? "show" : ""
            }`}
        >
          <a href="/" className="logoA">
            <img src="../../assets/images/logo/logoTMS.png" alt="logo" />
          </a>
          <nav>
            <MenuBarProfile
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />
          </nav>
        </div>

        <main role="main" className="custom-content">
          <div className="header-profile">
            <HeaderProfile />
          </div>
          <div className="custom-content-2">
            {activeMenu === "profile" && <Profile />}
            {activeMenu === "history" && <TestHistory />}
            {activeMenu === "my-course" && <MyCourse />}
            {activeMenu === "ket-qua" && <LearningResultsPage />}
            {/* {activeMenu === "ket-qua" && <CourseResultsPage />} */}
            {activeMenu === "history-pay" && <PayHistory />}
            {activeMenu === "history-document" && <DocumentHistory />}
            {activeMenu === "overview" && (
              <Overview

                onViewDetails={() => console.log("View details clicked")}
              />
            )}
            {activeMenu === "chat" && <Chat />}
            {activeMenu === "enable-course" && <EnableCourse />}
            {activeMenu === "upgrade" && <Upgrade />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountManagement;
