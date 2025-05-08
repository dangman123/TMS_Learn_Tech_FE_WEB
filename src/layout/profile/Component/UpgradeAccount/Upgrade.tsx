import React, { useState } from "react";
import { ArrowLeft, Check, X, Star, Tag } from "react-bootstrap-icons";
import "./Upgrade.css";

const Upgrade: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("year");
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [expandedFaq, setExpandedFaq] = useState<string>("switch");
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const handleSwitchPlan = (plan: string): void => {
    // Hiển thị xác nhận chuyển đổi gói
    const confirmSwitch = window.confirm(
      `Bạn có chắc chắn muốn chuyển sang gói ${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      }?`
    );

    if (confirmSwitch) {
      // Xử lý chuyển đổi gói
      console.log(`Đang chuyển sang gói ${plan}`);

      // Có thể gọi API để chuyển đổi gói ở đây
      // Ví dụ:
      // api.switchPlan(plan).then(() => {
      //   setSelectedPlan(plan);
      //   alert(`Bạn đã chuyển sang gói ${plan} thành công!`);
      // }).catch(error => {
      //   console.error('Lỗi khi chuyển đổi gói:', error);
      //   alert('Có lỗi xảy ra khi chuyển đổi gói. Vui lòng thử lại sau.');
      // });

      // Giả lập chuyển đổi gói thành công
      setTimeout(() => {
        setSelectedPlan(plan);
        alert(
          `Bạn đã chuyển sang gói ${
            plan.charAt(0).toUpperCase() + plan.slice(1)
          } thành công!`
        );
      }, 1000);
    }
  };
  // Xử lý chọn kỳ hạn thanh toán
  const handlePeriodChange = (period: string): void => {
    setSelectedPeriod(period);
  };

  // Xử lý chọn gói thành viên
  const handlePlanSelect = (plan: string): void => {
    setSelectedPlan(plan);
  };

  // Xử lý mở/đóng câu hỏi thường gặp
  const toggleFaq = (faqId: string): void => {
    if (expandedFaq === faqId) {
      setExpandedFaq(""); // Thay vì null, sử dụng chuỗi rỗng
    } else {
      setExpandedFaq(faqId);
    }
  };

  // Xử lý hiển thị/ẩn bảng so sánh
  const toggleComparison = (): void => {
    setShowComparison(!showComparison);
  };

  // Xử lý quay lại trang trước đó
  const handleGoBack = (): void => {
    window.history.back();
  };

  return (
    <div className="upgrade-container">
      {/* Header */}
      <div className="upgrade-header">
        <div className="header-title">Gói thành viên</div>
      </div>
      {/* Banner nâng cấp */}
      <div className="upgrade-banner">
        <div className="banner-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <div className="banner-content">
          <h2 className="banner-title">Nâng cấp tài khoản ngay</h2>
          <p className="banner-subtitle">Mở khóa toàn bộ tính năng cao cấp</p>
        </div>
      </div>
      {/* Lợi ích khi nâng cấp */}
      <div className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Truy cập không giới hạn</div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Hỗ trợ ưu tiên</div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Tải tài liệu</div>
        </div>
      </div>
      {/* Chọn thời hạn */}
      <div className="section-title">Chọn thời hạn</div>
      <div className="period-selection">
        <button
          className={`period-button ${
            selectedPeriod === "month" ? "active" : ""
          }`}
          onClick={() => handlePeriodChange("month")}
        >
          Hàng tháng
        </button>
        <button
          className={`period-button ${
            selectedPeriod === "6month" ? "active" : ""
          }`}
          onClick={() => handlePeriodChange("6month")}
        >
          <span className="button-text">6 tháng</span>
          <div className="popular-badge">
            <Star size={12} /> Phổ biến
          </div>
        </button>
        <button
          className={`period-button ${
            selectedPeriod === "year" ? "active" : ""
          }`}
          onClick={() => handlePeriodChange("year")}
        >
          <span className="button-text">Hàng năm</span>
          <div className="discount-badge">
            <Tag size={12} /> Tiết kiệm 20%
          </div>
        </button>
      </div>
      {/* Chọn gói thành viên */}
      <div className="section-title">Chọn gói thành viên</div>

      <div className="plans-container">
        {" "}
        <div
          className={`plan-card ${selectedPlan === "basic" ? "selected" : ""}`}
        >
          <div className="plan-header">
            <h3 className="plan-name">Basic</h3>
            <div className="plan-price">1.990.000đ</div>
          </div>

          <ul className="plan-features">
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Truy cập 50+ khóa học cơ bản</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Học không giới hạn 24/7</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">
                Nhận chứng chỉ hoàn thành khóa học
              </span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Hỗ trợ qua email</span>
            </li>
          </ul>

          <div className="plan-button-group">
            <button
              className="plan-button"
              onClick={() => handlePlanSelect("basic")}
            >
              Chọn gói này
            </button>
            <button
              className="plan-switch-button"
              onClick={() => handleSwitchPlan("basic")}
            >
              Đổi gói Basic
            </button>
          </div>
        </div>
        <div
          className={`plan-card premium ${
            selectedPlan === "premium" ? "selected" : ""
          }`}
        >
          <div className="plan-header">
            <h3 className="plan-name">Premium</h3>
            <div className="plan-price">3.490.000đ</div>
          </div>

          <ul className="plan-features">
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Truy cập toàn bộ khóa học</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Học không giới hạn 24/7</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">
                Nhận chứng chỉ hoàn thành khóa học
              </span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Hỗ trợ qua email và chat</span>
            </li>
            <li className="feature-highlight">
              <Check className="check-icon highlight" size={20} />
              <span className="feature-text">Tài liệu học tập độc quyền</span>
              <span className="highlight-tag">Nổi bật</span>
            </li>
            <li className="feature-highlight">
              <Check className="check-icon highlight" size={20} />
              <span className="feature-text">Thảo luận 1-1 với giảng viên</span>
              <span className="highlight-tag">Nổi bật</span>
            </li>
          </ul>

          <div className="plan-button-group">
            <button
              className="plan-button premium-button"
              onClick={() => handlePlanSelect("premium")}
            >
              Đăng ký ngay
            </button>
            <button
              className="plan-switch-button premium-switch-button"
              onClick={() => handleSwitchPlan("premium")}
            >
              Đổi gói Premium
            </button>
          </div>
        </div>
        <div
          className={`plan-card ${
            selectedPlan === "business" ? "selected" : ""
          }`}
        >
          <div className="plan-header">
            <h3 className="plan-name">Business</h3>
            <div className="plan-price">6.990.000đ</div>
          </div>

          <ul className="plan-features">
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Truy cập toàn bộ khóa học</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Học không giới hạn 24/7</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">
                Nhận chứng chỉ hoàn thành khóa học
              </span>
            </li>
            <li className="feature-highlight">
              <Check className="check-icon highlight" size={20} />
              <span className="feature-text">
                Hỗ trợ 24/7 qua email, chat và điện thoại
              </span>
              <span className="highlight-tag">Nổi bật</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Tài liệu học tập độc quyền</span>
            </li>
            <li>
              <Check className="check-icon" size={20} />
              <span className="feature-text">Thảo luận 1-1 với giảng viên</span>
            </li>
          </ul>

          <div className="plan-button-group">
            <button
              className="plan-button"
              onClick={() => handlePlanSelect("business")}
            >
              Chọn gói này
            </button>
            <button
              className="plan-switch-button business-switch-button"
              onClick={() => handleSwitchPlan("business")}
            >
              Đổi gói Business
            </button>
          </div>
        </div>
      </div>

      {/* So sánh các gói */}
      <div className="comparison-section" onClick={toggleComparison}>
        <h3 className="comparison-title">So sánh các gói thành viên</h3>
        {showComparison && (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Tính năng</th>
                  <th>Basic</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Truy cập khóa học</td>
                  <td className="limited">Giới hạn</td>
                  <td className="full">Không giới hạn</td>
                </tr>
                <tr>
                  <td>Tải tài liệu</td>
                  <td className="limited">Giới hạn</td>
                  <td className="full">Không giới hạn</td>
                </tr>
                <tr>
                  <td>Chứng chỉ</td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Hỗ trợ</td>
                  <td>Email</td>
                  <td>Email & Chat</td>
                </tr>
                <tr>
                  <td>Thảo luận với giảng viên</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Học theo nhóm</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Quản lý nhóm</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Báo cáo tiến độ</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Câu hỏi thường gặp */}
      <div className="faq-section">
        <h3 className="faq-title">Câu hỏi thường gặp</h3>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("switch")}>
            <div className="question-text">
              Tôi có thể đổi gói thành viên không?
            </div>
            <div
              className={`faq-arrow ${
                expandedFaq === "switch" ? "expanded" : ""
              }`}
            >
              {expandedFaq === "switch" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "switch" && (
            <div className="faq-answer">
              Bạn có thể nâng cấp gói thành viên bất kỳ lúc nào. Khi nâng cấp,
              chúng tôi sẽ tính phí chênh lệch tương ứng với thời gian còn lại
              của gói hiện tại.
            </div>
          )}
        </div>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("auto-renew")}>
            <div className="question-text">Có tự động gia hạn không?</div>
            <div
              className={`faq-arrow ${
                expandedFaq === "auto-renew" ? "expanded" : ""
              }`}
            >
              {expandedFaq === "auto-renew" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "auto-renew" && (
            <div className="faq-answer">
              Có, gói thành viên sẽ được tự động gia hạn khi hết hạn sử dụng.
              Bạn có thể tắt tính năng tự động gia hạn trong phần cài đặt tài
              khoản.
            </div>
          )}
        </div>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("cancel")}>
            <div className="question-text">
              Tôi có thể hủy gói thành viên không?
            </div>
            <div
              className={`faq-arrow ${
                expandedFaq === "cancel" ? "expanded" : ""
              }`}
            >
              {expandedFaq === "cancel" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "cancel" && (
            <div className="faq-answer">
              Bạn có thể hủy gói thành viên bất kỳ lúc nào trong phần cài đặt
              tài khoản. Khi hủy, bạn vẫn có thể sử dụng gói đã thanh toán cho
              đến hết thời hạn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
