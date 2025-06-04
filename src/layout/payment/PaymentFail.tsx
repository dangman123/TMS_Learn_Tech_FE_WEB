import React, { useState, useEffect } from "react";


interface PaymentError {
  code: string;
  message: string;
  suggestion: string;
}

export const PaymentFail = () => {
  const [error, setError] = useState<PaymentError | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Animation effect on mount
    setTimeout(() => {
      setFadeIn(true);
    }, 100);

    // Get error details from URL parameters or use mock data
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get("error_code");

    // Handle different error types or use mock data
    if (errorCode) {
      handleErrorCode(errorCode);
    } else {
      // Mock data for demo/preview
      setError({
        code: "PAYMENT_DECLINED",
        message: "Giao dịch đã bị từ chối bởi ngân hàng của bạn",
        suggestion: "Vui lòng kiểm tra lại thông tin thẻ và số dư tài khoản",
      });
    }
  }, []);

  const handleErrorCode = (code: string) => {
    switch (code) {
      case "INSUFFICIENT_FUNDS":
        setError({
          code: "INSUFFICIENT_FUNDS",
          message: "Tài khoản của bạn không đủ số dư để hoàn tất giao dịch",
          suggestion:
            "Vui lòng kiểm tra số dư và thử lại với phương thức thanh toán khác",
        });
        break;
      case "CONNECTION_ERROR":
        setError({
          code: "CONNECTION_ERROR",
          message: "Đã xảy ra lỗi kết nối trong quá trình xử lý thanh toán",
          suggestion: "Vui lòng kiểm tra kết nối internet và thử lại sau",
        });
        break;
      case "SESSION_EXPIRED":
        setError({
          code: "SESSION_EXPIRED",
          message: "Phiên thanh toán đã hết hạn",
          suggestion: "Vui lòng thử lại giao dịch từ đầu",
        });
        break;
      default:
        setError({
          code: "PAYMENT_ERROR",
          message: "Có sự cố xảy ra khi xử lý thanh toán của bạn",
          suggestion: "Vui lòng thử lại hoặc liên hệ hỗ trợ",
        });
    }
  };

  // Redirect function
  const handleTryAgain = () => {
    window.location.href = "/khoa-hoc/thanh-toan";
  };

  return (
    <section
      className={`payment-result-section payment-fail ${
        fadeIn ? "fade-in" : ""
      }`}
    >
      <div className="container">
        <div className="payment-result-content">
          <div className="result-header">
            <div className="result-icon fail-icon">
              <i className="fa fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p className="subtitle">
              {error?.message || "Có sự cố xảy ra trong quá trình thanh toán"}
            </p>
          </div>

          <div className="error-details">
            <div className="error-code">
              <span>Mã lỗi:</span> {error?.code || "UNKNOWN_ERROR"}
            </div>

            <div className="error-suggestion">
              <i className="fa fa-lightbulb-o"></i>
              <p>
                {error?.suggestion || "Vui lòng thử lại hoặc liên hệ hỗ trợ"}
              </p>
            </div>
          </div>

          <div className="next-actions">
            <button onClick={handleTryAgain} className="btn btn-primary">
              <i className="fa fa-refresh"></i> Thử lại thanh toán
            </button>
            <a href="/gio-hang" className="btn btn-outline">
              <i className="fa fa-shopping-cart"></i> Quay lại giỏ hàng
            </a>
          </div>

          <div className="additional-options">
            <div className="option">
              <i className="fa fa-credit-card"></i>
              <div>
                <h4>Kiểm tra phương thức thanh toán</h4>
                <p>Bạn có thể thử với phương thức thanh toán khác</p>
              </div>
            </div>

            <div className="option">
              <i className="fa fa-headphones"></i>
              <div>
                <h4>Liên hệ hỗ trợ</h4>
                <p>
                  Gọi <strong>1900 1234</strong> hoặc gửi email đến{" "}
                  <a href="mailto:support@yourdomain.com">
                    support@yourdomain.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="back-link">
            <a href="/" className="home-link">
              <i className="fa fa-arrow-left"></i> Trở về trang chủ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentFail;
