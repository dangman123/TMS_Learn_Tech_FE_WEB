import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown";
// import { Category } from "../../model/Category";

import { DocumentModel } from "../../model/DocumentModel";
import "./Header.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../util/fucntion/auth";
import topics from "../util/fucntion/topics";
import { useLoading } from "../util/LoadingContext";
import useCozeChat from "../../hooks/useCozeChat";

// Tree-structured category interface
interface CategoryTree {
  id: number;
  name: string;
  level: number;
  children: CategoryTree[];
}

interface Notification {
  id: number;
  title: string;
  message: string;
  topic: string;
  createdAt: string;
  status: boolean;
}

const Header: React.FC = () => {
  // Initialize Coze Chat
  useCozeChat({
    token: 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe',
    title: 'TMS Tư Vấn'
  });

  const [unreadCount, setUnreadCount] = useState(5);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { startLoading, stopLoading } = useLoading();
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  useEffect(() => {
    const client = new Client({
      brokerURL: `ws://${process.env.REACT_APP_SERVER_HOST}/ws`,
      webSocketFactory: () =>
        new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`),
      onConnect: () => {
        console.log("WebSocket connected");

        topics.forEach((topic) => {
          client.subscribe(`/topic/${topic}`, (message) => {
            const newNotification: Notification = JSON.parse(message.body);
            setNotifications((prev) => [newNotification, ...prev]);
            setUnreadCount((prev) => prev + 1);
          });
        });

        const userId = getUserData();
        if (userId) {
          client.subscribe(
            `/user/${userId.id}/queue/notifications`,
            (message) => {
              const newNotification: Notification = JSON.parse(message.body);
              console.log(message.body);
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          );
        }
      },
      onStompError: (frame) => {
        console.error("WebSocket error:", frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const [categoriesTree, setCategoriesTree] = useState<CategoryTree[]>([]);
  const [coursesCategoriesTree, setCoursesCategoriesTree] = useState<CategoryTree[]>([]);
  const [documentsSearch, setDocumentsSearch] = useState<DocumentModel[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  // Hàm lấy số lượng sản phẩm trong giỏ hàng từ API
  const fetchCartItemsCount = async () => {
    try {
      const userData = getUserData();
      if (!userData || !userData.id) return;

      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/cart/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch cart items");
        return;
      }

      const responseData = await response.json();

      if (responseData.status === 200 && responseData.data) {
        // Nếu data là một mảng, thì lấy độ dài của mảng
        const itemCount = Array.isArray(responseData.data)
          ? responseData.data.length
          : 0;
        setCartItemCount(itemCount);
      }
    } catch (error) {
      console.error("Error fetching cart items count:", error);
    }
  };

  useEffect(() => {
    let token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);

      const auth = localStorage.getItem("authData");
      if (auth) {
        try {
          const parsedAuthData = JSON.parse(auth);
          setUserName(parsedAuthData.fullname || "");
        } catch (error) {
          console.error("Error parsing authData:", error);
        }
      }

      // Lấy số lượng sản phẩm trong giỏ hàng từ API khi đã đăng nhập
      fetchCartItemsCount();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Lắng nghe sự kiện cập nhật giỏ hàng
  useEffect(() => {
    // Tạo một hàm xử lý sự kiện
    const handleCartUpdate = () => {
      fetchCartItemsCount();
    };

    // Đăng ký sự kiện
    window.addEventListener("cart-updated", handleCartUpdate);

    // Dọn dẹp khi component unmount
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const navigate = useNavigate(); // Để điều hướng trang

  // Fetch dữ liệu từ API khi component được mount
  useEffect(() => {
    // startLoading();
    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/data`)
      .then((response) => response.json())
      .then((data) => {
        // Chuyển đổi dữ liệu API thành mảng các DocumentModel
        const documentModels: DocumentModel[] = data.map((item: any) => ({
          documentId: item[0],
          documentTitle: item[1],
          image_url: item[2],
          url: item[3],
          view: item[4],
          created_at: item[5],
          download_count: item[6],
          name: item[7],
        }));
        setDocumentsSearch(documentModels);
        // stopLoading();
      })
      .catch((error) => console.error("Error fetching data:", error));

    const fetchCategories = async () => {
      // startLoading();
      try {
        // Fetch document categories using the tree API
        const response = await axios.get<{ data: CategoryTree[] }>(`${process.env.REACT_APP_SERVER_HOST}/api/categories/tree?level=1&type=DOCUMENT`);
        if (response.data && response.data.data) {
          setCategoriesTree(response.data.data);
        }
        // stopLoading();
      } catch (error) {
        // stopLoading();
        console.error("Error fetching categories:", error);
      }
    };

    const fetchCourseCategories = async () => {
      // startLoading();
      try {
        // Fetch course categories using the tree API
        const response = await axios.get<{ data: CategoryTree[] }>(`${process.env.REACT_APP_SERVER_HOST}/api/categories/tree?level=1&type=COURSE`);
        if (response.data && response.data.data) {
          setCoursesCategoriesTree(response.data.data);
        }
        // stopLoading();
      } catch (error) {
        // stopLoading();
        console.error("Error fetching categories:", error);
      }
    };

    const fetchNotifications = async () => {
      // startLoading();
      try {
        let token = localStorage.getItem("authToken");

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
        // Check if the data is in a paginated format

        if (
          data &&
          typeof data === "object" &&
          data.content &&
          Array.isArray(data.content)
        ) {
          setNotifications(data.content);
          // stopLoading();
          // Ensure we're filtering an array
          const unreadCount = Array.isArray(data.content)
            ? data.content.filter(
              (notification: Notification) => !notification.status
            ).length
            : 0;
          setUnreadCount(unreadCount);
        } else {
          // Backward compatibility for case when API returns notifications directly as an array
          console.log(
            "Notifications not in expected format, trying fallback handling"
          );
          const safeNotifications = Array.isArray(data) ? data : [];
          setNotifications(safeNotifications);
          setUnreadCount(
            safeNotifications.filter(
              (notification: Notification) => !notification.status
            ).length

          );
        }
      } catch (error) {
        // stopLoading();
        console.error("Error fetching notifications:", error);
      }
    };
    fetchCategories();
    fetchCourseCategories();
    let token = localStorage.getItem("authToken");
    if (token) {
      fetchNotifications();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authData");
    setIsLoggedIn(false);
    window.location.href = "/dang-nhap";
  };
  const removeVietnameseTones = (str: any) => {
    return str
      .normalize("NFD") // Chuyển đổi ký tự Unicode
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/đ/g, "d") // Thay thế chữ đ thường
      .replace(/Đ/g, "D") // Thay thế chữ Đ hoa
      .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .toLowerCase(); // Chuyển tất cả thành chữ thường
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleRouter = () => { };

  return (
    <div
      className="header__container"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <div className="header__main">
        {/* Logo */}
        <a href="/" className="logo">
          <img src="../../assets/images/logo/logoTMS.png" alt="logo" />
        </a>

        {/* Main Menu */}
        <div className="main-menu">
          <nav>
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>

              <li>
                <a
                  href="/tai-lieu"
                  onClick={() => {
                    localStorage.removeItem("iddanhmuctailieu");
                  }}
                >
                  Tài liệu
                  <i className="fa-solid fa-angle-down"></i>
                </a>
                <ul className="sub-menu">
                  {/* Hiển thị danh mục TÀI LIỆU sử dụng cấu trúc cây */}
                  {categoriesTree.map((level1) => (
                    <li key={level1.id} className="level1-item">
                      <a
                        href={`/tai-lieu/${removeVietnameseTones(level1.name)}`}
                        onClick={() => {
                          localStorage.setItem(
                            "danhmuctailieu",
                            removeVietnameseTones(level1.name)
                          );
                          localStorage.setItem("danhmuctailieuVN", level1.name);
                          localStorage.setItem(
                            "iddanhmuctailieu",
                            level1.id.toString()
                          );
                          localStorage.removeItem("iddanhmuctailieu");
                        }}
                      >
                        {level1.name}
                      </a>
                      {/* Hiển thị danh mục TÀI LIỆU cấp 2 */}
                      {level1.children && level1.children.length > 0 && (
                        <ul className="sub-sub-menu">
                          {level1.children.map((level2) => (
                            <li key={level2.id} className="level2-item">
                              <a
                                href={`/tai-lieu/${removeVietnameseTones(
                                  level2.name
                                )}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    "danhmuctailieu",
                                    removeVietnameseTones(level2.name)
                                  );
                                  localStorage.setItem(
                                    "iddanhmuctailieu",
                                    level2.name
                                  );
                                  localStorage.setItem(
                                    "iddanhmuctailieu",
                                    level1.id.toString()
                                  );
                                  localStorage.setItem(
                                    "iddanhmuctailieu",
                                    level2.id.toString()
                                  );
                                }}
                              >
                                {level2.name}
                              </a>
                              {/* Hiển thị danh mục TÀI LIỆU cấp 3 nếu có */}
                              {level2.children && level2.children.length > 0 && (
                                <ul className="sub-sub-sub-menu">
                                  {level2.children.map((level3) => (
                                    <li key={level3.id} className="level3-item">
                                      <a
                                        href={`/tai-lieu/${removeVietnameseTones(
                                          level3.name
                                        )}`}
                                        onClick={() => {
                                          localStorage.setItem(
                                            "danhmuctailieu",
                                            removeVietnameseTones(level3.name)
                                          );
                                          localStorage.setItem(
                                            "iddanhmuctailieu",
                                            level3.name
                                          );
                                          localStorage.setItem(
                                            "iddanhmuctailieu",
                                            level1.id.toString()
                                          );
                                          localStorage.setItem(
                                            "iddanhmuctailieu",
                                            level2.id.toString()
                                          );
                                          localStorage.setItem(
                                            "iddanhmuctailieu",
                                            level3.id.toString()
                                          );
                                        }}
                                      >
                                        {level3.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <a
                  href="/khoa-hoc"
                  onClick={() => {
                    localStorage.removeItem("iddanhmuckhoahoc");
                    localStorage.removeItem("level");
                  }}
                >
                  Khóa học
                  <i className="fa-solid fa-angle-down"></i>
                </a>
                <ul className="sub-menu">
                  {coursesCategoriesTree.map((level1) => (
                    <li key={level1.id} className="level1-item">
                      <a
                        href={`/khoa-hoc/danh-muc/${removeVietnameseTones(
                          level1.name
                        )}`}
                        onClick={() => {
                          localStorage.setItem(
                            "danhmuckhoahoc",
                            removeVietnameseTones(level1.name)
                          );
                          localStorage.setItem("danhmuckhoahocVN", level1.name);
                          localStorage.setItem(
                            "iddanhmuckhoahoc",
                            level1.id.toString()
                          );
                          localStorage.setItem("level", "1");
                          // localStorage.removeItem("iddanhmuckhoahoc");
                          // localStorage.removeItem("level");

                        }}
                      >
                        {level1.name}
                      </a>
                      {level1.children && level1.children.length > 0 && (
                        <ul className="sub-sub-menu">
                          {level1.children.map((level2) => (
                            <li key={level2.id} className="level2-item">
                              <a
                                href={`/khoa-hoc/danh-muc/${removeVietnameseTones(
                                  level2.name
                                )}`}
                                onClick={() => {
                                  localStorage.setItem(
                                    "danhmuckhoahoc",
                                    removeVietnameseTones(level2.name)
                                  );
                                  localStorage.setItem(
                                    "danhmuckhoahocVN",
                                    level2.name
                                  );
                                  // localStorage.setItem(
                                  //   "iddanhmuckhoahoc",
                                  //   level1.id.toString()
                                  // );
                                  localStorage.setItem(
                                    "iddanhmuckhoahoc",
                                    level2.id.toString()
                                  );
                                  localStorage.setItem("level", "2");
                                }}
                              >
                                {level2.name}
                              </a>
                              {/* Thêm danh mục cấp 3 khóa học ở đây nếu có */}
                              {level2.children && level2.children.length > 0 && (
                                <ul className="sub-sub-sub-menu">
                                  {level2.children.map((level3) => (
                                    <li key={level3.id} className="level3-item">
                                      <a
                                        href={`/khoa-hoc/danh-muc/${removeVietnameseTones(
                                          level3.name
                                        )}`}
                                        onClick={() => {
                                          localStorage.setItem(
                                            "danhmuckhoahoc",
                                            removeVietnameseTones(level3.name)
                                          );
                                          localStorage.setItem(
                                            "danhmuckhoahoc",
                                            level3.name
                                          );
                                          // localStorage.setItem(
                                          //   "iddanhmuckhoahoc",
                                          //   level1.id.toString()
                                          // );
                                          // localStorage.setItem(
                                          //   "iddanhmuckhoahoc",
                                          //   level2.id.toString()
                                          // );
                                          localStorage.setItem(
                                            "iddanhmuckhoahoc",
                                            level3.id.toString()
                                          );
                                          localStorage.setItem("level", "3");
                                        }}
                                      >
                                        {level3.name}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a href="/de-thi" onClick={() => {
                  localStorage.removeItem("iddanhmucdethi");
                  localStorage.removeItem("levelDethi");
                  localStorage.removeItem("danhmucdethi");
                }}>
                  Bài thi
                </a>
              </li>
              <li>
                <a href="/bai-viet">Bài viết</a>
              </li>
              <li>
                <a href="/ho-tro">Hỗ trợ</a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className={`offcanvas-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="menu-header">
            <div className="menu-title">Menu</div>

          </div>

          {isLoggedIn && (
            <div className="user-info">
              <div className="user-avatar">
                <i className="fa-solid fa-user"></i>
              </div>
              <div className="user-name">{userName}</div>
            </div>
          )}

          <ul>
            <li>
              <a href="/">Trang chủ</a>
            </li>
            <li>
              <a href="/tai-lieu" className="has-children">Tài liệu</a>
            </li>
            <li>
              <a href="/khoa-hoc" className="has-children">Khóa học</a>
            </li>
            <li>
              <a href="/de-thi">Bài thi</a>
            </li>
            <li>
              <a href="/bai-viet">Bài viết</a>
            </li>
            <li>
              <a href="/ho-tro">Hỗ trợ</a>
            </li>
            {isLoggedIn && (
              <li>
                <a href="/tai-khoan">Tài khoản</a>
              </li>
            )}
            {isLoggedIn && (
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </li>
            )}
            {!isLoggedIn && (
              <>
                <li>
                  <a href="/dang-nhap">Đăng nhập</a>
                </li>
                <li>
                  <a href="/dang-ky">Đăng ký</a>
                </li>
              </>
            )}
          </ul>
        </div>

        <div
          className={`offcanvas-overlay ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        ></div>

        {/* Right side icons */}
        <div className="d-flex align-items-center gap-4 gap-xl-5">
          {isLoggedIn ? (
            <>
              {/* Cart Icon */}
              <li className="text-white">
                <a href="/gio-hang" className="gio-hang-icon">
                  <i className="fa-solid fa-cart-shopping icon-giohang"></i>
                  {cartItemCount > 0 && (
                    <span className="cart-count">{cartItemCount}</span>
                  )}
                </a>
              </li>

              {/* Notification */}
              <NotificationDropdown
                notifications={
                  Array.isArray(notifications) ? notifications : []
                }
                unreadCount={unreadCount}
              />

              {/* User Dropdown */}
              <div className="user-dropdown">
                <div className="user-icon">
                  <a href="/tai-khoan">
                    <i className="fa-solid fa-user"></i> {userName}
                  </a>
                </div>

                <ul className="dropdown-menu">
                  <li>
                    <a href="/tai-khoan">Tài khoản</a>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="menu-btns d-none d-lg-flex">
              <a className="active" href="/dang-nhap">
                Đăng nhập
              </a>
              <a href="/dang-ky">Đăng ký</a>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button className={`menubars ${isMenuOpen ? "active" : ""}`} type="button" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default Header;
