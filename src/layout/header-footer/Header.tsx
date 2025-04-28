import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown";
import { Category } from "../../model/Category";
import {
  GET_USER_CATEGORY_LEVEL_1,
  GET_USER_CATEGORY_LEVEL_2,
  GET_USER_CATEGORY_LEVEL_3,

  // token_default,
} from "../../api/api";

import "./styleHeader.css";
import { DocumentModel } from "../../model/DocumentModel";
import "./Header.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../util/fucntion/auth";
import topics from "../util/fucntion/topics";
import { useLoading } from "../util/LoadingContext";

interface CategoryCourse {
  id: number;
  name: string;
  create_at: Date;
  update_at: Date;
}
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

const Header: React.FC = () => {
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
      webSocketFactory: () => new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`),
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



  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>(
    []
  );
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);

  const [level1CategoriesCourse, setLevel1CategoriesCourse] = useState<Category[]>([]);
  const [level2CategoriesCourse, setLevel2CategoriesCourse] = useState<Category[]>([]);
  const [level3CategoriesCourse, setLevel3CategoriesCourse] = useState<Category[]>([]);


  const [documentsSearch, setDocumentsSearch] = useState<DocumentModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentModel[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [cartItemCount, setCartItemCount] = useState<number>(0);



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
    } else {
      setIsLoggedIn(false);
    }
    const cartData = sessionStorage.getItem("cart");
    if (cartData) {
      const cartItems = JSON.parse(cartData);
      setCartItemCount(cartItems.length);
    }
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
        const level1Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_1);
        const level1Filtered = level1Response.data.filter(category => category.type === "document");
        setLevel1Categories(level1Filtered);

        const level2Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_2);
        const level2Filtered = level2Response.data.filter(category => category.type === "document");
        setLevel2Categories(level2Filtered);

        const level3Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_3);
        const level3Filtered = level3Response.data.filter(category => category.type === "document");
        setLevel3Categories(level3Filtered);

        // stopLoading();
      } catch (error) {
        // stopLoading();
        console.error("Error fetching categories:", error);
      }
    };



    const fetchCourseCategories = async () => {
      // startLoading();
      try {
        const level1Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_1);
        const level1Filtered = level1Response.data.filter(category => category.type === "course");
        setLevel1CategoriesCourse(level1Filtered);

        const level2Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_2);
        const level2Filtered = level2Response.data.filter(category => category.type === "course");
        setLevel2CategoriesCourse(level2Filtered);

        const level3Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_3);
        const level3Filtered = level3Response.data.filter(category => category.type === "course");
        setLevel3CategoriesCourse(level3Filtered);

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
        // Kiểm tra xem token có hết hạn không, nếu hết hạn thì refresh
        // if (isTokenExpired(token)) {
        //   token = await refresh();
        //   if (!token) {
        //     window.location.href = "/dang-nhap";
        //     return;
        //   }
        //   localStorage.setItem("authToken", token);
        // }

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
        setNotifications(data); // Cập nhật danh sách thông báo
        // stopLoading();
        setUnreadCount(
          data.filter((notification) => !notification.readStatus).length // Cập nhật số lượng chưa đọc
        );
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

  // Group categories
  const groupedCategoriesLevel2 = level2Categories.reduce((acc, category) => {
    if (category.parentId) {
      acc[category.parentId] = acc[category.parentId] || [];
      acc[category.parentId].push(category);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  const groupedCategoriesLevel3 = level3Categories.reduce((acc, category) => {
    if (category.parentId) {
      acc[category.parentId] = acc[category.parentId] || [];
      acc[category.parentId].push(category);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  // Group categories
  const groupedCategoriesLevel2Course = level2CategoriesCourse.reduce((acc, category) => {
    if (category.parentId) {
      acc[category.parentId] = acc[category.parentId] || [];
      acc[category.parentId].push(category);
    }
    return acc;
  }, {} as Record<number, Category[]>);

  const groupedCategoriesLevel3Course = level3CategoriesCourse.reduce((acc, category) => {
    if (category.parentId) {
      acc[category.parentId] = acc[category.parentId] || [];
      acc[category.parentId].push(category);
    }
    return acc;
  }, {} as Record<number, Category[]>);



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setShowResults(false); // Ẩn kết quả khi input trống
      setFilteredDocuments([]);
    } else {
      setShowResults(true); // Hiển thị kết quả khi có từ khóa

      // Tìm kiếm trong danh sách tài liệu đã tải trước
      const results = documentsSearch.filter((document) =>
        document.documentTitle.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDocuments(results);
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {

      navigate(`/tim-kiem?keyword=${searchTerm}`);
    }
  };

  // Ẩn kết quả tìm kiếm khi người dùng rời khỏi ô input
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Sử dụng setTimeout để đảm bảo rằng onClick của phần tử kết quả không bị bỏ qua
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

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


  const handleRouter = () => {

  }
  return (
    <div className="header__container">
      <div className="header__main">
        <a href="/" className="logo">
          <img src="../../assets/images/logo/logoTMS.png" alt="logo" />
        </a>
        <div className="main-menu">
          <nav>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>

              <li>
                <a
                  href="/tai-lieu"
                  onClick={() => {
                    localStorage.removeItem("iddanhmuctailieu");
                  }}
                >
                  Tài liệu <i className="fa-solid fa-angle-down"></i>
                </a>
                <ul className="sub-menu">
                  {level1Categories.map((level1) => (
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
                        }}
                      >
                        {level1.name}
                      </a>
                      <ul className="sub-sub-menu">
                        {groupedCategoriesLevel2[level1.id]?.map((level2) => (
                          <li key={level2.id}>
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
                                  "danhmuctailieuVN",
                                  level2.name
                                );
                                localStorage.setItem(
                                  "iddanhmuctailieu",
                                  level2.id.toString()
                                );
                              }}
                            >
                              {level2.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <a
                  href="/khoa-hoc"
                  onClick={() => {
                    localStorage.removeItem("iddanhmuckhoahoccap1");
                    localStorage.removeItem("iddanhmuckhoahoccap2");
                  }}

                >
                  Khóa học <i className="fa-solid fa-angle-down"></i>
                </a>
                <ul className="sub-menu">
                  {level1CategoriesCourse.map((level1) => (
                    <li key={level1.id} className="level1-item">
                      <a
                        href={`/khoa-hoc/${removeVietnameseTones(level1.name)}`}
                        onClick={() => {
                          localStorage.setItem(
                            "danhmuckhoahoc",
                            removeVietnameseTones(level1.name)
                          );
                          localStorage.setItem("danhmuckhoahocVN", level1.name);
                          localStorage.setItem(
                            "iddanhmuckhoahoccap1",
                            level1.id.toString()
                          );
                          localStorage.removeItem(
                            "iddanhmuckhoahoccap2"
                          );
                        }}
                      >
                        {level1.name}
                      </a>
                      <ul className="sub-sub-menu">
                        {groupedCategoriesLevel2Course[level1.id]?.map((level2) => (
                          <li key={level2.id}>
                            <a
                              href={`/khoa-hoc/${removeVietnameseTones(
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
                                localStorage.setItem(
                                  "iddanhmuckhoahoccap1",
                                  level1.id.toString()
                                );
                                localStorage.setItem(
                                  "iddanhmuckhoahoccap2",
                                  level2.id.toString()
                                );
                              }}
                            >
                              {level2.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a href="/de-thi" onClick={handleRouter}>Đề Thi</a>
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

        <div className={`offcanvas-menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/tai-lieu">Tài liệu</a>
            </li>
            <li>
              <a href="/khoa-hoc">Khóa học</a>
            </li>
            <li>
              <a href="/bai-viet">Bài viết</a>
            </li>
            <li>
              <a href="/ho-tro">Hỗ trợ</a>
            </li>
          </ul>
        </div>
        <div
          className={`offcanvas-overlay ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        ></div>
        <div></div>
        <div className="d-flex align-items-center gap-4 gap-xl-5">
          <div className="menu-search">
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu ..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowResults(true)} // Hiển thị khi người dùng click vào input
              onBlur={handleBlur} // Ẩn khi người dùng rời khỏi input
            />
            <button onClick={() => navigate(`/tim-kiem?keyword=${searchTerm}`)}>
              <a href="">
                <i className="fa-regular fa-magnifying-glass"></i>
              </a>
            </button>
          </div>

          {showResults && searchTerm && filteredDocuments.length > 0 && (
            <div className="search-results">
              {filteredDocuments.map((document) => (
                <div className="search-result-item" key={document.documentId}>
                  <a
                    href={`/tai-lieu/${removeVietnameseTones(document.name)}/${document.documentId
                      }`}
                    rel="noopener noreferrer"
                  >
                    <img
                      src={document.image_url}
                      alt={document.documentTitle}
                      style={{
                        width: "50px",
                        height: "50px",
                        marginRight: "10px",
                      }}
                    />
                    {document.documentTitle}
                  </a>
                </div>
              ))}
            </div>
          )}

          {isLoggedIn ? (
            // Nếu đã đăng nhập, hiển thị icon User và tên người dùng
            <>
              <li className="text-white">
                <a href="/gio-hang" className="gio-hang-icon">
                  <i className="fa-solid fa-cart-shopping icon-giohang"></i>
                  {cartItemCount > 0 && (
                    <span className="cart-count">{cartItemCount}</span>
                  )}
                </a>
              </li>
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
              />
              <div className="user-dropdown">
                <div className="user-icon">
                  <a href="/tai-khoan">
                    <i className="fa-solid fa-user"></i> {userName}
                  </a>
                </div>
                {/* Dropdown menu */}
                <ul className="dropdown-menu">
                  <li>
                    <a href="/tai-khoan">Tài Khoản</a>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng Xuất
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            // Nếu chưa đăng nhập, hiển thị các nút Đăng nhập và Đăng ký
            <div className="menu-btns d-none d-lg-flex">
              <a className="active" href="/dang-nhap">
                Đăng nhập
              </a>
              <a href="/dang-ky">Đăng ký</a>
            </div>
          )}
        </div>
        <button className="menubars" type="button" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};
export default Header;
