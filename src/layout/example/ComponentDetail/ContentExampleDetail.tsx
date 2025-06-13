import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  BarChart2,
  Book,
  Star,
  Award,
  AlertCircle,
  Edit,
  Gift,
  Check,
  Users,
  Calendar,
  FileText,
  Globe,
  ShoppingCart,
} from "lucide-react";
import "./examDetail.css";
import { sendActionActivity } from "../../../service/WebSocketActions";

interface ExamData {
  testId: number;
  title: string;
  courseId: number;
  courseTitle: string;
  author: string;
  itemCountReview: number;
  rating: number;
  totalQuestion: number;
  level: "EASY" | "MEDIUM" | "HARD";
  examType: "FREE" | "FEE";
  description: string;
  intro: string;
  testContent: string;
  knowledgeRequirement: string;
  imageUrl: string;
  duration: number;
  itemCountPrice: number;
  status: string;
  price: number;
  cost: number;
  percentDiscount: number;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  rating: number;
  review: string;
  updated_at: string;
  created_at: string;
  account_id: number;
  course_id: number | null;
  test_id: number;
  fullname: string;
  image: string;
}

interface ReviewResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const ExamDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "requirements" | "reviews"
  >("overview");
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 10;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [isInCart, setIsInCart] = useState<boolean>(false);

  // Lấy userId từ localStorage nếu user đã đăng nhập
  const getUserId = (): number | null => {
    try {
      const authData = localStorage.getItem("authData");
      if (!authData) return null;

      const userData = JSON.parse(authData);
      return userData.id || null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return null;
    }
  };

  // Trích xuất testId từ slug URL
  const extractTestId = () => {
    if (!slug) return null;

    // Tìm ID ở cuối URL, sau dấu gạch ngang cuối cùng
    const match = slug.match(/[-](\d+)$/);
    if (match && match[1]) {
      return match[1];
    }

    // Nếu không tìm thấy cách trên, thử kiểm tra xem toàn bộ slug có phải là số
    if (/^\d+$/.test(slug)) {
      return slug;
    }

    console.error("Không thể trích xuất ID đề thi từ URL:", slug);
    return null;
  };

  const testId = extractTestId();

  useEffect(() => {
    const fetchExamData = async () => {
      if (!testId) {
        setError("Không tìm thấy ID đề thi");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Lấy userId từ localStorage
        const userId = getUserId();

        // Tạo URL API với accountId nếu đã đăng nhập
        const apiUrl = `${process.env.REACT_APP_SERVER_HOST
          }/api/tests/exam/public/${testId}${userId ? `?accountId=${userId}` : ""
          }`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch exam data");
        }

        const responseData = await response.json();
        setExamData(responseData.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    // Fetch đánh giá từ API
    const fetchReviews = async () => {
      if (!testId) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/reviews/exam/${testId}?page=${currentPage}&size=${reviewsPerPage}`
        );
        if (!response.ok) {
          console.error("Lỗi khi tải đánh giá");
          return;
        }

        const responseData = await response.json();

        // Dữ liệu thực tế nằm trong responseData.data
        if (responseData && responseData.status === 200 && responseData.data) {
          console.log("Dữ liệu đánh giá:", responseData.data);
          // Truy cập đúng cấu trúc dữ liệu
          setReviews(responseData.data.content || []);
          setReviewsTotalPages(responseData.data.totalPages || 0);
        } else {
          console.error("Cấu trúc dữ liệu đánh giá không đúng:", responseData);
          setReviews([]);
          setReviewsTotalPages(0);
        }
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
        setReviews([]);
        setReviewsTotalPages(0);
      }
    };

    fetchExamData();
    fetchReviews();
  }, [testId, currentPage]);

  // Kiểm tra xem đề thi đã có trong giỏ hàng chưa khi component được tải
  useEffect(() => {
    if (testId) {
      checkIfItemInCart();
    }
  }, [testId]);

  // Hàm kiểm tra đề thi đã có trong giỏ hàng chưa
  const checkIfItemInCart = async () => {
    try {
      const userId = getUserId();
      const token = localStorage.getItem("authToken");

      if (!userId || !token || !testId) return;

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Không thể kiểm tra giỏ hàng");
        return;
      }

      const cartData = await response.json();

      if (cartData.status === 200 && cartData.data) {
        // Kiểm tra xem testId có trong giỏ hàng không
        const isTestInCart = cartData.data.some(
          (item: any) => item.testId === Number(testId)
        );

        setIsInCart(isTestInCart);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", error);
    }
  };

  // Handle join exam
  const handleJoinExam = () => {
    const userId = getUserId();

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!userId) {
      toast.warning("Vui lòng đăng nhập để bắt đầu làm bài");
      // Chuyển hướng đến trang đăng nhập và lưu URL hiện tại để quay lại sau khi đăng nhập
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/dang-nhap");
      return;
    }

    if (!testId) {
      toast.error("Không thể bắt đầu làm bài: ID đề thi không hợp lệ");
      return;
    }

    // Nếu đề thi miễn phí hoặc đã mua, chuyển đến trang làm bài
    if (examData?.examType === "FREE" || examData?.purchased) {
      navigate(`/take-test/${testId}`);
      return;
    }

    // Nếu đề thi đã có trong giỏ hàng, chuyển đến trang giỏ hàng
    if (isInCart) {
      goToCart();
      return;
    }

    // Nếu đề thi có phí và chưa mua, thêm vào giỏ hàng
    addToCart();
  };

  // Thêm đề thi vào giỏ hàng
  const addToCart = async () => {
    try {
      const userId = getUserId();
      if (!userId || !testId || !examData) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        navigate("/dang-nhap");
        return;
      }

      // Lấy token từ localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigate("/dang-nhap");
        return;
      }

      // Tạo đối tượng dữ liệu để gửi lên API
      const cartData = {
        type: "EXAM", // Mặc định là EXAM theo yêu cầu
        price: examData.price,
        courseId: null,
        testId: Number(testId),
        courseBundleId: null,
        cartItemId: "",
      };

      const data = { "testId": Number(testId), "courseId": null, "lessonId": null, "videoId": null, "action": "Thêm đề thi vào giỏ hàng" + examData.title }
      if (userId) {
        sendActionActivity(userId?.toString() || "", "/app/add_course_to_cart", data, "Thêm đề thi vào giỏ hàng" + examData.title)
      }
      // sendActionActivity(userId?.toString() || "", "/app/add_course_to_cart", data, "Thêm đề thi vào giỏ hàng" + examData.title)

      // Gọi API để thêm vào giỏ hàng
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}/add-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cartData),
        }
      );

      const responseData = await response.json();

      // Xử lý phản hồi từ API
      if (responseData.status === 200) {
        toast.success("Đã thêm đề thi vào giỏ hàng");
        setIsInCart(true); // Cập nhật state để biết đề thi đã có trong giỏ hàng

        // Phát sự kiện để cập nhật số lượng giỏ hàng trong header
        window.dispatchEvent(new Event("cart-updated"));
      } else if (responseData.status === 409) {
        // Nếu đề thi đã có trong giỏ hàng (mã lỗi 409 = conflict)
        toast.info("Đề thi này đã có trong giỏ hàng của bạn");
        setIsInCart(true);
      } else {
        // Các lỗi khác
        toast.error(responseData.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      // Xử lý lỗi kết nối hoặc lỗi JS
      console.error("Lỗi khi thêm vào giỏ hàng:", error);

      // Kiểm tra xem đề thi đã được thêm thành công chưa
      await checkIfItemInCart();

      if (isInCart) {
        toast.success("Đã thêm đề thi vào giỏ hàng");
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };

  // Chuyển đến trang giỏ hàng
  const goToCart = () => {
    navigate("/gio-hang");
  };

  if (loading) {
    return (
      <div className="exam-loading-container">
        <div className="exam-loading-spinner"></div>
        <div className="exam-loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="exam-error-container">
        <div className="exam-error-box">
          <AlertCircle className="exam-error-icon" size={48} />
          <h2 className="exam-error-title">Không thể tải dữ liệu</h2>
          <p className="exam-error-message">
            {error || "Không tìm thấy thông tin đề thi"}
          </p>
          <button onClick={() => navigate(-1)} className="exam-error-button">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const formattedMinutes =
      minutes < 10 ? String(minutes).padStart(2, "0") : minutes;
    const remainingSeconds = seconds % 60;
    const formattedSecond =
      remainingSeconds < 10
        ? String(remainingSeconds).padStart(2, "0")
        : remainingSeconds;
    return `${formattedMinutes}:${formattedSecond}`;
  };

  // Format level to Vietnamese
  const formatLevel = (level: string): string => {
    switch (level) {
      case "EASY":
        return "Dễ";
      case "MEDIUM":
        return "Trung bình";
      case "HARD":
        return "Khó";
      default:
        return level;
    }
  };

  // Get level class based on difficulty
  const getLevelClass = (level: string): string => {
    switch (level) {
      case "EASY":
        return "exam-level-easy";
      case "MEDIUM":
        return "exam-level-medium";
      case "HARD":
        return "exam-level-hard";
      default:
        return "";
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Xử lý đổi trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Kiểm tra nếu người dùng có thể làm bài thi
  const canTakeExam = examData.examType === "FREE" || examData.purchased;

  // Thay thế hàm renderActionButton() hiện tại với đoạn mã này:

  const renderActionButton = () => {
    return (
      <a
        href="#"
        className={`btn-one exam-button ${isInCart && !canTakeExam ? 'cart-button' : ''}`}
        onClick={handleJoinExam}
      >
        {canTakeExam
          ? "Làm bài"
          : isInCart
            ? "Đến giỏ hàng"
            : examData?.examType === "FREE"
              ? "Làm miễn phí"
              : "Thêm vào giỏ hàng"}
        <i className={`${isInCart && !canTakeExam ? 'fa-solid fa-shopping-cart' : 'fa-light fa-arrow-right-long'}`}></i>
      </a>
    );
  };

  return (
    <div className="exam-container">
      {/* Main Content - Two Column Layout */}
      <div className="exam-content-wrapper">
        {/* Left Column - Main Content */}
        <div className="exam-main-content">
          {/* Banner Image */}
          {examData.imageUrl && (
            <div className="exam-image-container">
              <img
                src={examData.imageUrl}
                alt={examData.title}
                className="exam-image"
              />
            </div>
          )}

          {/* Course Info Bar */}
          <div className="exam-info-bar">
            <div className="exam-tag">{examData.courseTitle}</div>
            <h2 className="exam-main-title">{examData.title}</h2>
            <div className="exam-meta">
              <div className="exam-meta-item">
                <span>Tạo bởi: </span>
                <span className="exam-meta-value">{examData.author}</span>
              </div>
              <div className="exam-meta-item">
                <Clock size={16} />
                <span className="exam-meta-value">
                  {formatDuration(examData.duration)}
                </span>
              </div>
              <div className="exam-meta-item">
                <Star size={16} className="exam-star-icon" />
                <span className="exam-meta-value">
                  {examData.rating.toFixed(1)} ({examData.itemCountReview} đánh
                  giá)
                </span>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="exam-tabs-container">
            <div className="exam-tabs-header">
              <button
                className={`exam-tab-button ${activeTab === "overview" ? "exam-tab-active" : ""
                  }`}
                onClick={() => setActiveTab("overview")}
              >
                Tổng quan
              </button>
              <button
                className={`exam-tab-button ${activeTab === "requirements" ? "exam-tab-active" : ""
                  }`}
                onClick={() => setActiveTab("requirements")}
              >
                Yêu cầu
              </button>
              <button
                className={`exam-tab-button ${activeTab === "reviews" ? "exam-tab-active" : ""
                  }`}
                onClick={() => setActiveTab("reviews")}
              >
                Đánh giá ({examData.itemCountReview})
              </button>
            </div>

            <div className="exam-tab-content">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="exam-overview-tab">
                  <h2 className="exam-section-title">
                    <Book className="exam-section-icon" size={20} />
                    Giới thiệu đề thi
                  </h2>
                  <div
                    className="exam-section-text"
                    dangerouslySetInnerHTML={{
                      __html:
                        examData.intro || "Chưa có giới thiệu cho đề thi này.",
                    }}
                  />

                  {examData.testContent && (
                    <>
                      <h2 className="exam-section-title exam-section-title-with-gap">
                        <Check className="exam-section-icon" size={20} />
                        Nội dung đề thi
                      </h2>
                      <div
                        className="exam-section-text"
                        dangerouslySetInnerHTML={{
                          __html: examData.testContent,
                        }}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Requirements Tab */}
              {activeTab === "requirements" && (
                <div className="exam-requirements-tab">
                  <h2 className="exam-section-title">
                    <Award className="exam-section-icon" size={20} />
                    Yêu cầu kiến thức
                  </h2>
                  <div
                    className="exam-section-text"
                    dangerouslySetInnerHTML={{
                      __html:
                        examData.knowledgeRequirement ||
                        "Chưa có yêu cầu kiến thức cho đề thi này.",
                    }}
                  />
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="exam-reviews-tab">
                  <h2 className="exam-section-title">
                    <Star className="exam-section-icon" size={20} />
                    Đánh giá từ học viên
                  </h2>

                  {reviews.length > 0 ? (
                    <>
                      <div className="exam-rating-container">
                        <div className="exam-rating-box">
                          <span className="exam-rating-number">
                            {examData.rating.toFixed(1)}
                          </span>
                        </div>
                        <div className="exam-rating-stars">
                          <div className="exam-stars-row">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={
                                  i < Math.round(examData.rating)
                                    ? "exam-star-filled"
                                    : "exam-star-empty"
                                }
                              />
                            ))}
                          </div>
                          <p className="exam-rating-count">
                            {examData.itemCountReview} đánh giá
                          </p>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="exam-reviews-list">
                        {reviews.map((review) => (
                          <div key={review.id} className="exam-review-item">
                            <div className="exam-review-header">
                              <div className="exam-review-user">
                                <div className="exam-review-avatar">
                                  {review.image ? (
                                    <img
                                      src={review.image}
                                      alt={review.fullname}
                                      className="review-avatar-img"
                                    />
                                  ) : (
                                    <span>
                                      {review.fullname.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="exam-review-user-info">
                                  <p className="exam-review-username">
                                    {review.fullname}
                                  </p>
                                  <div className="exam-review-rating">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        size={16}
                                        className={
                                          i < review.rating
                                            ? "exam-star-filled"
                                            : "exam-star-empty"
                                        }
                                      />
                                    ))}
                                    <span className="exam-review-date-small">
                                      {formatDate(review.updated_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="exam-review-date">
                                {formatDate(review.updated_at)}
                              </p>
                            </div>
                            <div className="exam-review-content-wrapper">
                              <p className="exam-review-content">
                                {review.review}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {reviewsTotalPages > 0 && (
                        <div className="exam-pagination">
                          <button
                            className="exam-pagination-button"
                            disabled={currentPage === 0}
                            onClick={() => handlePageChange(currentPage - 1)}
                          >
                            &lt;
                          </button>
                          {Array.from({ length: reviewsTotalPages }).map(
                            (_, idx) => (
                              <button
                                key={idx}
                                className={`exam-pagination-button ${currentPage === idx
                                    ? "exam-pagination-active"
                                    : ""
                                  }`}
                                onClick={() => handlePageChange(idx)}
                              >
                                {idx + 1}
                              </button>
                            )
                          )}
                          <button
                            className="exam-pagination-button"
                            disabled={currentPage >= reviewsTotalPages - 1}
                            onClick={() => handlePageChange(currentPage + 1)}
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="exam-no-reviews">
                      <div className="exam-no-reviews-icon-container">
                        <AlertCircle
                          className="exam-no-reviews-icon"
                          size={32}
                        />
                      </div>
                      <p className="exam-no-reviews-text">
                        Chưa có đánh giá nào cho đề thi này
                      </p>
                      <p className="exam-no-reviews-subtext">
                        Hãy là người đầu tiên chia sẻ trải nghiệm của bạn
                      </p>
                    </div>
                  )}

                  <div className="exam-write-review-section">
                    <h3 className="exam-write-review-title">
                      Chia sẻ trải nghiệm học tập của bạn
                    </h3>
                    <p className="exam-write-review-description">
                      Đánh giá của bạn sẽ giúp cải thiện chất lượng đề thi và
                      giúp người học khác có lựa chọn phù hợp
                    </p>
                    <button className="exam-write-review-button">
                      <Edit className="exam-write-review-icon" size={18} />
                      <span>Viết đánh giá</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="exam-sidebar">
          <div className="exam-sidebar-card">
            <h3 className="exam-sidebar-title">Đề thi bao gồm:</h3>
            <ul className="exam-sidebar-list">
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <Clock size={20} className="exam-sidebar-icon" />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Thời gian:</p>
                  <p className="exam-sidebar-value">
                    {formatDuration(examData.duration)}
                  </p>
                </div>
              </li>
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <HelpCircle size={20} className="exam-sidebar-icon" />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Câu hỏi:</p>
                  <p className="exam-sidebar-value">{examData.totalQuestion}</p>
                </div>
              </li>
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <BarChart2
                    size={20}
                    className={`exam-sidebar-icon ${getLevelClass(
                      examData.level
                    )}`}
                  />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Độ khó:</p>
                  <p
                    className={`exam-sidebar-value ${getLevelClass(
                      examData.level
                    )}`}
                  >
                    {formatLevel(examData.level)}
                  </p>
                </div>
              </li>
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <Calendar size={20} className="exam-sidebar-icon" />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Cập nhật:</p>
                  <p className="exam-sidebar-value">
                    {formatDate(examData.updatedAt)}
                  </p>
                </div>
              </li>
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <FileText size={20} className="exam-sidebar-icon" />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Môn học:</p>
                  <p className="exam-sidebar-value">{examData.courseTitle}</p>
                </div>
              </li>
              <li className="exam-sidebar-item">
                <div className="exam-sidebar-icon-container">
                  <Users size={20} className="exam-sidebar-icon" />
                </div>
                <div className="exam-sidebar-text">
                  <p className="exam-sidebar-label">Tác giả:</p>
                  <p className="exam-sidebar-value">{examData.author}</p>
                </div>
              </li>
            </ul>

            <div className="exam-price-section">
              {examData.examType === "FREE" ? (
                <div className="exam-free-label">
                  <Gift className="exam-free-icon" size={20} />
                  <span>Miễn phí</span>
                </div>
              ) : (
                <>
                  <div className="exam-price">
                    {examData.price.toLocaleString()} đ
                  </div>
                  {examData.percentDiscount > 0 && (
                    <div className="exam-discount">
                      <span className="exam-original-price">
                        {examData.cost.toLocaleString()} đ
                      </span>
                      <span className="exam-discount-badge">
                        -{examData.percentDiscount}%
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Button thay đổi dựa trên trạng thái mua/chưa mua */}
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;
