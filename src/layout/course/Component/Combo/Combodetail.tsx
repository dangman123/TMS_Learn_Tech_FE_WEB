import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ComboDetail.css";

interface Course {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  cost: number;
  author: string;
  purchased: boolean;
  percentDiscount: number;
  lessonCount: number;
  studentCount: number;
  itemCountReview: number;
  rating: number;
  categoryName: string;
  duration: number;
  type: string;
  level: string;
}

interface ComboDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  cost: number;
  courses: Course[];
  discount: number;
  status: string;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  purchased: boolean;
}

const ComboDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comboDetail, setComboDetail] = useState<ComboDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchComboDetail = async () => {
      try {
        setLoading(true);
        
        // Lấy userId nếu đã đăng nhập
        const userId = getUserId();
        
        // Gọi API với id của combo
        const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/${id}${userId ? `?accountId=${userId}` : ''}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error("Không thể tải thông tin combo khóa học");
        }
        
        const data = await response.json();
        
        if (data.status === 200 && data.data) {
          setComboDetail(data.data);
        } else {
          throw new Error(data.message || "Không thể tải thông tin combo khóa học");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu");
        console.error("Error fetching combo details:", error);
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra combo đã có trong giỏ hàng chưa
    const checkIfComboInCart = async () => {
      try {
        const userId = getUserId();
        if (!userId || !id) return;
        
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error("Không thể kiểm tra giỏ hàng");
          return;
        }
        
        const cartData = await response.json();
        
        if (cartData.status === 200 && cartData.data) {
          // Kiểm tra xem combo id có trong giỏ hàng không
          const isComboInCart = cartData.data.some((item: any) => 
            item.courseBundleId === Number(id)
          );
          
          setIsInCart(isComboInCart);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra giỏ hàng:", error);
      }
    };

    fetchComboDetail();
    checkIfComboInCart();
  }, [id]);

  // Tính tổng giá của các khóa học riêng lẻ
  const calculateTotalIndividualPrice = (): number => {
    if (!comboDetail?.courses || comboDetail.courses.length === 0) return 0;
    return comboDetail.courses.reduce((sum, course) => sum + course.price, 0);
  };

  // Tính số tiền tiết kiệm
  const calculateSavings = (): number => {
    const totalIndividualPrice = calculateTotalIndividualPrice();
    return totalIndividualPrice - (comboDetail?.price || 0);
  };

  // Tính phần trăm tiết kiệm
  const calculateSavingsPercentage = (): number => {
    const totalIndividualPrice = calculateTotalIndividualPrice();
    if (totalIndividualPrice <= 0) return 0;
    
    return Math.round(((totalIndividualPrice - (comboDetail?.price || 0)) / totalIndividualPrice) * 100);
  };

  // Hàm định dạng thời gian từ giây thành MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  };

  // Hàm format giá tiền
  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm định dạng level khóa học sang tiếng Việt
  const formatLevel = (level: string): string => {
    switch (level) {
      case 'BEGINNER': return 'Cơ bản';
      case 'INTERMEDIATE': return 'Trung cấp';
      case 'ADVANCED': return 'Nâng cao';
      default: return level;
    }
  };

  // Thêm combo vào giỏ hàng
  const addToCart = async () => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        toast.warn("Vui lòng đăng nhập để thêm vào giỏ hàng");
        navigate("/dang-nhap");
        return;
      }
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn");
        navigate("/dang-nhap");
        return;
      }
      
      // Tạo dữ liệu cho API
      const cartData = {
        type: "COMBO",
        price: comboDetail?.price,
        courseId: null,
        testId: null,
        courseBundleId: Number(id),
        cartItemId: ""
      };
      
      // Gọi API thêm vào giỏ hàng
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}/add-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cartData)
        }
      );
      
      const responseData = await response.json();
      
      if (responseData.status === 200) {
        toast.success("Đã thêm combo vào giỏ hàng");
        setIsInCart(true);
        
        // Phát sự kiện để cập nhật số lượng giỏ hàng trong header
        window.dispatchEvent(new Event('cart-updated'));
      } else if (responseData.status === 409) {
        toast.info("Combo này đã có trong giỏ hàng của bạn");
        setIsInCart(true);
      } else {
        toast.error(responseData.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };

  // Chuyển đến trang giỏ hàng
  const goToCart = () => {
    navigate("/gio-hang");
  };

  // Hiển thị sao đánh giá
  const renderStars = (rating: number) => {
    return (
      <div className="combo-course-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star}
            className={`fa-${star <= rating ? 'solid' : 'regular'} fa-star`}
          />
        ))}
        <span>({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return <div className="combo-detail-loading">Đang tải thông tin khóa học...</div>;
  }

  if (error || !comboDetail) {
    return (
      <div className="combo-detail-error">
        <h3>Không thể tải thông tin</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="combo-detail-container">
      {/* Hero Section */}
      <div className="combo-detail-hero" style={{ backgroundImage: `url(${comboDetail.imageUrl})` }}>
        <div className="combo-detail-overlay"></div>
        <div className="container">
          <div className="combo-detail-hero-content">
            <h1>{comboDetail.name}</h1>
            <p className="combo-detail-description">{comboDetail.description}</p>
            <div className="combo-detail-stats">
              <div className="combo-detail-stat">
                <i className="fa-solid fa-book"></i>
                <span>{comboDetail.courses.length} khóa học</span>
              </div>
              <div className="combo-detail-stat">
                <i className="fa-solid fa-users"></i>
                <span>{comboDetail.salesCount} học viên đã mua</span>
              </div>
              <div className="combo-detail-stat">
                <i className="fa-solid fa-tag"></i>
                <span>Tiết kiệm {calculateSavingsPercentage()}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="combo-detail-main">
          <div className="combo-detail-content">
            <div className="combo-detail-section">
              <h2 className="combo-detail-section-title">Khóa học trong combo</h2>
              <div className="combo-courses-list">
                {comboDetail.courses.map((course) => (
                  <div key={course.id} className="combo-course-card">
                    <div className="combo-course-image">
                      <img src={course.imageUrl} alt={course.title} />
                    </div>
                    <div className="combo-course-content">
                      <h3 className="combo-course-title">{course.title}</h3>
                      <div className="combo-course-info">
                        <span className="combo-course-author">
                          <i className="fa-solid fa-user"></i> {course.author}
                        </span>
                        <span className="combo-course-level">
                          <i className="fa-solid fa-signal"></i> {formatLevel(course.level)}
                        </span>
                        <span className="combo-course-duration">
                          <i className="fa-regular fa-clock"></i> {formatTime(course.duration)}
                        </span>
                      </div>
                      <div className="combo-course-meta">
                        {renderStars(course.rating)}
                        <div className="combo-course-students">
                          <i className="fa-solid fa-user-graduate"></i> {course.studentCount} học viên
                        </div>
                      </div>
                      <div className="combo-course-price">
                        <span className="combo-course-current-price">{formatPrice(course.price)}</span>
                        {course.cost > course.price && (
                          <span className="combo-course-original-price">{formatPrice(course.cost)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="combo-detail-section">
              <h2 className="combo-detail-section-title">Lý do nên mua combo</h2>
              <div className="combo-benefits">
                <div className="combo-benefit">
                  <div className="combo-benefit-icon">
                    <i className="fa-solid fa-money-bill-wave"></i>
                  </div>
                  <div className="combo-benefit-content">
                    <h3>Tiết kiệm chi phí</h3>
                    <p>Tiết kiệm {formatPrice(calculateSavings())} so với mua riêng từng khóa học</p>
                  </div>
                </div>
                <div className="combo-benefit">
                  <div className="combo-benefit-icon">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div className="combo-benefit-content">
                    <h3>Lộ trình học hoàn chỉnh</h3>
                    <p>Được thiết kế bởi các chuyên gia hàng đầu giúp bạn phát triển kỹ năng toàn diện</p>
                  </div>
                </div>
                <div className="combo-benefit">
                  <div className="combo-benefit-icon">
                    <i className="fa-solid fa-infinity"></i>
                  </div>
                  <div className="combo-benefit-content">
                    <h3>Truy cập trọn đời</h3>
                    <p>Học bất cứ khi nào, bất cứ nơi đâu và không bị giới hạn thời gian</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="combo-detail-sidebar">
            <div className="combo-detail-pricing-card">
              <div className="combo-detail-price-container">
                <div className="combo-detail-price">
                  <span className="combo-detail-current-price">{formatPrice(comboDetail.price)}</span>
                  {comboDetail.cost > comboDetail.price && (
                    <span className="combo-detail-original-price">{formatPrice(comboDetail.cost)}</span>
                  )}
                </div>
                <div className="combo-detail-savings">
                  Tiết kiệm <span>{formatPrice(calculateSavings())}</span>
                </div>
              </div>

              <div className="combo-detail-price-summary">
                <div className="combo-detail-price-item">
                  <span>Giá các khóa học:</span>
                  <span>{formatPrice(calculateTotalIndividualPrice())}</span>
                </div>
                <div className="combo-detail-price-item">
                  <span>Giá combo:</span>
                  <span>{formatPrice(comboDetail.price)}</span>
                </div>
                <div className="combo-detail-price-item highlight">
                  <span>Tiết kiệm:</span>
                  <span>{calculateSavingsPercentage()}%</span>
                </div>
              </div>

              {comboDetail.purchased ? (
                <button className="combo-detail-btn purchased">
                  <i className="fa-solid fa-check"></i> Đã mua
                </button>
              ) : isInCart ? (
                <button className="combo-detail-btn goto-cart" onClick={goToCart}>
                  <i className="fa-solid fa-shopping-cart"></i> Đến giỏ hàng
                </button>
              ) : (
                <button className="combo-detail-btn add-to-cart" onClick={addToCart}>
                  <i className="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng
                </button>
              )}

              <div className="combo-detail-features">
                <div className="combo-detail-feature">
                  <i className="fa-solid fa-infinity"></i>
                  <span>Truy cập trọn đời</span>
                </div>
                <div className="combo-detail-feature">
                  <i className="fa-solid fa-certificate"></i>
                  <span>Chứng chỉ hoàn thành</span>
                </div>
                <div className="combo-detail-feature">
                  <i className="fa-solid fa-mobile-alt"></i>
                  <span>Học trên mọi thiết bị</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboDetail;
