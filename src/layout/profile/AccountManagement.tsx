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
import Ranking from "./Component/Ranking";
const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("profile");

  useEffect(() => {
    const path = location.pathname.split("/")[2];
    setActiveMenu(path || "profile");
  }, [location]);

  const handleMenuClick = (menu: string) => {
    if (menu === "logout") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authData");
      window.location.href = "/dang-nhap";
    } else {
      navigate(`/tai-khoan/${menu}`);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-100">
        <div className="col-md-3 col-lg-3 d-md-block sidebar custom-nav-profile">
          <nav style={{ position: "relative" }}>
            <MenuBarProfile
              activeMenu={activeMenu}
              onMenuClick={handleMenuClick}
            />
          </nav>
        </div>

        <main
          role="main"
          className="col-md-9 ml-sm-9 col-lg-9 px-md-4"
          style={{ flex: "1" }}
        >
          <div className="content">
            {activeMenu === "profile" && <Profile />}
            {activeMenu === "history" && <TestHistory />}
            {activeMenu === "my-course" && <MyCourse />}
            {activeMenu === "ket-qua" && <ResultPage />}
            {activeMenu === "history-pay" && <PayHistory />}
            {activeMenu === "history-document" && <DocumentHistory />}
            {activeMenu === "chat" && <Chat />}
            {activeMenu === "enable-course" && <EnableCourse />}
            {activeMenu === "ranking" && <Ranking />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountManagement;
