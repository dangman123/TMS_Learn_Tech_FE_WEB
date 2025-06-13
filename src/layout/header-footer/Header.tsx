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
  id: number;
  title: string;
  message: string;
  topic: string;
  createdAt: string;
  status: boolean;
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

  const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>(
    []
  );
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);

  const [level1CategoriesCourse, setLevel1CategoriesCourse] = useState<
    Category[]
  >([]);
  const [level2CategoriesCourse, setLevel2CategoriesCourse] = useState<
    Category[]
  >([]);
  const [level3CategoriesCourse, setLevel3CategoriesCourse] = useState<
    Category[]
  >([]);

  const [documentsSearch, setDocumentsSearch] = useState<DocumentModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentModel[]>(
    []
  );
  const [showResults, setShowResults] = useState(false);

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
        const level1Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_1
        );
        const level1Filtered = level1Response.data.filter(
          (category) => category.type === "DOCUMENT"
        );
        setLevel1Categories(level1Filtered);

        const level2Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_2
        );
        const level2Filtered = level2Response.data.filter(
          (category) => category.type === "DOCUMENT"
        );
        setLevel2Categories(level2Filtered);

        const level3Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_3
        );
        const level3Filtered = level3Response.data.filter(
          (category) => category.type === "DOCUMENT"
        );
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
        const level1Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_1
        );
        const level1Filtered = level1Response.data.filter(
          (category) => category.type === "COURSE"
        );
        setLevel1CategoriesCourse(level1Filtered);

        const level2Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_2
        );
        const level2Filtered = level2Response.data.filter(
          (category) => category.type === "COURSE"
        );
        setLevel2CategoriesCourse(level2Filtered);

        const level3Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_3
        );
        const level3Filtered = level3Response.data.filter(
          (category) => category.type === "COURSE"
        );
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
  const groupedCategoriesLevel2Course = level2CategoriesCourse.reduce(
    (acc, category) => {
      if (category.parentId) {
        acc[category.parentId] = acc[category.parentId] || [];
        acc[category.parentId].push(category);
      }
      return acc;
    },
    {} as Record<number, Category[]>
  );

  const groupedCategoriesLevel3Course = level3CategoriesCourse.reduce(
    (acc, category) => {
      if (category.parentId) {
        acc[category.parentId] = acc[category.parentId] || [];
        acc[category.parentId].push(category);
      }
      return acc;
    },
    {} as Record<number, Category[]>
  );

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

  const handleRouter = () => { };
  // ... phần import và code phía trên giữ nguyên

  // Phần render menu trong hàm return
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
                  {/* Hiển thị danh mục TÀI LIỆU cấp 1 */}
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
                          localStorage.removeItem("iddanhmuctailieu");
                        }}
                      >
                        {level1.name}
                      </a>
                      {/* Hiển thị danh mục TÀI LIỆU cấp 2 */}
                      <ul className="sub-sub-menu">
                        {groupedCategoriesLevel2[level1.id]?.map((level2) => (
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
                            {groupedCategoriesLevel3[level2.id]?.length > 0 && (
                              <ul className="sub-sub-sub-menu">
                                {groupedCategoriesLevel3[level2.id]?.map(
                                  (level3) => (
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
                                  )
                                )}
                              </ul>
                            )}
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
                    localStorage.removeItem("iddanhmuckhoahoc");
                    localStorage.removeItem("iddanhmuckhoahoc");
                  }}
                >
                  Khóa học
                  <i className="fa-solid fa-angle-down"></i>
                </a>
                <ul className="sub-menu">
                  {level1CategoriesCourse.map((level1) => (
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
                          localStorage.removeItem("iddanhmuckhoahoc");
                        }}
                      >
                        {level1.name}
                      </a>
                      <ul className="sub-sub-menu">
                        {groupedCategoriesLevel2Course[level1.id]?.map(
                          (level2) => (
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
                                  localStorage.setItem(
                                    "iddanhmuckhoahoc",
                                    level1.id.toString()
                                  );
                                  localStorage.setItem(
                                    "iddanhmuckhoahoc",
                                    level2.id.toString()
                                  );
                                }}
                              >
                                {level2.name}
                              </a>
                              {/* Thêm danh mục cấp 3 khóa học ở đây nếu có */}
                              {groupedCategoriesLevel3Course[level2.id]
                                ?.length > 0 && (

                                  <ul className="sub-sub-sub-menu">
                                    {groupedCategoriesLevel3Course[
                                      level2.id
                                    ]?.map((level3) => (
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
                                            localStorage.setItem(
                                              "iddanhmuckhoahoc",
                                              level1.id.toString()
                                            );
                                            localStorage.setItem(
                                              "iddanhmuckhoahoc",
                                              level2.id.toString()
                                            );
                                            localStorage.setItem(
                                              "iddanhmuckhoahoc",
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
                          )
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <a href="/de-thi" onClick={handleRouter}>
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

        <div className={`offcanvas-menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <a href="/">Trang chủ</a>
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

                notifications={
                  Array.isArray(notifications) ? notifications : []
                }

                unreadCount={unreadCount}
              />
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
