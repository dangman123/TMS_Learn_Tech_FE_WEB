import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Index from "./layout/homepage/Index";
import Document from "./layout/document/Document";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Document_Detail from "./layout/document/Document-detail";
import Breadcum from "./layout/util/Breadcum";
import { useState } from "react";
import AccountManagement from "./layout/profile/AccountManagement";
import Loading from "./layout/util/Loading";
import Example_Detail from "./layout/example/Example_Detail";
import Courses from "./layout/course/Courses";
import Blogs from "./layout/blogs/Blogs";
import BlogDetail from "./layout/blogs/BlogDetail";
import Contacts from "./layout/contact/Contact";
import MainLayout from "./layout/main-dom/MainLayout";
import Login from "./layout/login/Login";
import Register from "./layout/login/Register";
import ForgotPassword from "./layout/login/ForgotPassword";
import CourseDetail from "./layout/course/CourseDetail";
import Example from "./layout/example/Example";
import Search from "./layout/search/Search";
import withAuth from "./layout/DOM/withAuth";
import Cart from "./layout/cart/Cart";
import Checkout from "./layout/checkout/Checkout";
import ConfirmPuchase from "./layout/course/ConfirmPuchase";
import ComboDetail from "./layout/course/Component/Combo/Combodetail";

import NotificationDetails from "./layout/header-footer/NotificationDetails";
import NotificationDropdown from "./layout/header-footer/NotificationDropdown";
import Rank from "./layout/rank/Rank";
import { jwtDecode } from "jwt-decode";

import Test_Admin from "./layout/login/test";
import Header11 from "./layout/header-footer/demo";
import Test_Admin22 from "./layout/login/tesss2";

import { PaymentFail } from "./layout/payment/PaymentFail";
import PaymentSuccess from "./layout/payment/PaymentSuccess";
import { LogicPayment } from "./layout/util/LogicPayment";

import Error403 from "./layout/util/bao-loi-403";
import CourseVaoHoc from "./layout/course/CourseVaoHoc";
import demomoi2 from "./layout/util/demomoi2";
import DemoEcrypt from "./layout/util/demomoi2";

import ResetPassword from "./layout/login/ResetPassword";
import HomeLogin from "./layout/login/HomeLogin";
import { WebSocketProvider } from "./service/WebSocketContext";
import Cookies from "js-cookie";
import useRefreshToken from "./layout/util/fucntion/useRefreshToken";
import { isTokenExpired } from "./layout/util/fucntion/auth";
import NotificationList from "./layout/header-footer/NotificationList";

import { CoursePageConvert } from "./layout/courseConvert/CoursePageConvert";

import Spinner from "./layout/util/Spinner";
import { LoadingProvider } from "./layout/util/LoadingContext";

import VerifyOTP from "./layout/login/VerifyOTP";
import ChooseRegisterMethod from "./layout/login/ChooseRegisterMethod";
import VerifyOTPSMS from "./layout/login/VerifyOTPSMS";
import TakeTest from "./layout/take-test/take-test";
import ContentExampleDetail from "./layout/example/ComponentDetail/ContentExampleDetail";
import OverView from "./layout/profile/Component/OverView/OverView";
import { NotificationProvider } from "./layout/util/NotificationContext";
const ProtectedAccountManagement = withAuth(AccountManagement);
const ProtectedChechOut = withAuth(Checkout);

function App() {
  const refresh = useRefreshToken();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    handleAuth();
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", function () {
      var header = document.querySelector("header");
      if (window.scrollY > 0) {
        header?.classList.add("menu-fixed", "animated", "fadeInDown");
      } else {
        header?.classList.remove("menu-fixed", "animated", "fadeInDown");
      }
    });
    return () => {
      window.removeEventListener("scroll", function () {
        var header = document.querySelector("header");
        if (window.scrollY > 0) {
          header?.classList.add("menu-fixed", "animated", "fadeInDown");
        } else {
          header?.classList.remove("menu-fixed", "animated", "fadeInDown");
        }
      });
    };
  }, []);

  const handleAuth = async () => {
    const jwt = Cookies.get("authToken");
    const refreshToken = Cookies.get("refreshToken");
    const userInfo = Cookies.get("userInfo");

    if (jwt && refreshToken && userInfo) {
      const token = JSON.parse(decodeURIComponent(jwt));
      const user = JSON.parse(decodeURIComponent(userInfo));
      const refreshTokenNew = JSON.parse(decodeURIComponent(refreshToken));

      localStorage.setItem("authToken", token);
      localStorage.setItem("authData", JSON.stringify(user));
      localStorage.setItem("refreshToken", refreshTokenNew);

      Cookies.remove("authToken");
      Cookies.remove("refreshToken");
      Cookies.remove("userInfo");
      setTimeout(() => {
        toast.success("Đăng nhập thành công !");
      }, 1000);
    }
  };


  return (
    <NotificationProvider >
      <WebSocketProvider>
        <LoadingProvider>
          <div className="App">
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <MainLayout>
                      <Index />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tim-kiem"
                  element={
                    <MainLayout>
                      <Search />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tai-lieu"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Document />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tai-lieu/:danhmuc"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Document />
                    </MainLayout>
                  }
                />
                <Route
                  path="/tai-lieu/:danhmuc/:id"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Document_Detail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/de-thi"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Example />
                    </MainLayout>
                  }
                />
                <Route
                  path="/de-thi/:slug"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <ContentExampleDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/khoa-hoc"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Courses />
                    </MainLayout>
                  }
                />
                <Route
                  path="/khoa-hoc/:slug"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <CourseDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/khoa-hoc/danh-muc/:categoryName"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Courses />
                    </MainLayout>
                  }
                />
                <Route
                  path="/thanh-toan"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <ConfirmPuchase />
                    </MainLayout>
                  }
                />
                <Route
                  path="/khoa-hoc/thanh-toan/fail"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <PaymentFail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/khoa-hoc/thanh-toan/success"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <PaymentSuccess />
                    </MainLayout>
                  }
                />
                <Route
                  path="/combo/:id"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <ComboDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/take-test"
                  element={


                    <TakeTest />

                  }
                />
                <Route
                  path="/bai-viet"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Blogs />
                    </MainLayout>
                  }
                />
                <Route
                  path="/bai-viet/danh-muc/:categoryName"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Blogs />
                    </MainLayout>
                  }
                />

                <Route
                  path="/bai-viet/:id"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <BlogDetail />
                    </MainLayout>
                  }
                />
                <Route
                  path="/ho-tro"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Contacts />
                    </MainLayout>
                  }
                />
                <Route
                  path="/notification-all"
                  element={
                    <MainLayout>
                      <NotificationList />
                    </MainLayout>
                  }
                />
                <Route
                  path="/notification-details/:id"
                  element={
                    <MainLayout>
                      <NotificationDetails />
                    </MainLayout>
                  }
                />

                <Route path="/dang-nhap" element={<Login />} />

                <Route path="/dang-ky" element={<Register />} />
                <Route
                  path="/dang-ky-method"
                  element={<ChooseRegisterMethod />}
                />

                <Route path="/verify-otp-email" element={<VerifyOTP />} />
                <Route path="/verify-otp-sms" element={<VerifyOTPSMS />} />
                {/* <Route path="/test" element={<Test_Admin />} />
          <Route path="/test2" element={<Test_Admin22 />} /> */}
                {/* <Route path="/demo" element={<Header11 />} /> */}

                <Route
                  path="/demo"
                  element={
                    <MainLayout>
                      <Example />
                    </MainLayout>
                  }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/home" element={<HomeLogin />} />

                <Route path="/bao-loi-403" element={<Error403 />} />

                <Route
                  path="/tai-khoan"
                  element={<ProtectedAccountManagement />}
                />
                <Route
                  path="/tai-khoan/:menu"
                  element={<ProtectedAccountManagement />}
                />

                <Route
                  path="/khoa-hoc-thu/vao-hoc"
                  element={<CoursePageConvert />}
                />

                <Route path="/khoa-hoc/vao-hoc" element={<CourseVaoHoc />} />
                <Route
                  path="/khoa-hoc/vao-hoc/video"
                  element={<CourseVaoHoc />}
                />
                <Route path="/khoa-hoc/vao-hoc/test" element={<CourseVaoHoc />} />
                <Route
                  path="/khoa-hoc/vao-hoc/test-chapter"
                  element={<CourseVaoHoc />}
                />

                {/* <Route path="/demomoi" element={<DemoEcrypt/>} /> */}

                {/* Giỏ hàng */}
                <Route
                  path="/gio-hang"
                  element={
                    <MainLayout>
                      {/* <Breadcum /> */}
                      <Cart />
                    </MainLayout>
                  }
                />
                <Route
                  path="/thanh-toan/logic"
                  element={
                    <MainLayout>
                      <LogicPayment />
                    </MainLayout>
                  }
                />
              </Routes>

              <Routes>
                {/* <Route
              path="/admin/tai-lieu"
              element={
                <Home>
                  <DocumentAdminPage />
                </Home>
              }
            /> */}

                {/* <Route
                path="/admin/add-question"
                element={
                  <Home>
                    <AddQuestions />
                  </Home>
                }
              /> */}

                {/* <Route
                path="/admin/edit-bai-kiem-tra/:id"
                element={
                  <Home>
                    <EditExam />
                  </Home>
                }
              /> */}
                {/* <Route
                path="/admin/add-bai-kiem-tra"
                element={
                  <Home>
                    <AddExam />
                  </Home>
                }
              /> */}

                {/* <Route
              path="/admin/bai-hoc"
              element={
                <Home>
                  <LessonList />
                </Home>
              }
            /> */}
                {/* <Route
                path="/admin/edit-bai-hoc/:id"
                element={
                  <Home>
                    <EditLesson />
                  </Home>
                }
              /> */}

                {/* <Route
              path="/admin/login"
              element={
                <Home>
                  <Login />
                </Home>
              }
            /> */}
              </Routes>
            </BrowserRouter>
            <ToastContainer />
          </div>
        </LoadingProvider>
      </WebSocketProvider>
    </NotificationProvider>
  );
}

export default App;
