import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import "./ConfirmPuchase.css";

interface UserProfile {
  fullname: string;
  email: string;
  password: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  roleId: number;
}

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
}

function ConfirmPurchase() {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedAuthData = localStorage.getItem("authData");
    const token = localStorage.getItem("authToken");

    if (storedAuthData && token) {
      const parsedAuthData = JSON.parse(storedAuthData);

      fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/${parsedAuthData.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data: UserProfile) => {
          setUserInfo(data);
        })
        .catch((error) => {
          console.error("Error fetching account data:", error);
        });
    }
  }, []);

  useEffect(() => {
    const cartFromSessionStorage = sessionStorage.getItem("cart");

    if (cartFromSessionStorage) {
      const parsedCart = JSON.parse(cartFromSessionStorage);
      setCart(parsedCart);

      const total = parsedCart.reduce(
        (acc: number, item: CartItem) => acc + item.price,
        0
      );
      setTotalPrice(total);
    }
  }, []);

  const handlePayment = (method: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification("Bạn cần đăng nhập để thực hiện thanh toán.", "error");
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem("paymentMethod", method);

    // For demo, we're using VNPay API for all payment methods
    // In production, you would have different endpoints for different payment methods
    fetch(
      `${process.env.REACT_APP_SERVER_HOST}/api/payment/vnpay/vn-pay?amount=${totalPrice}&bankCode=NCB`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data && data.code === "ok" && data.paymentUrl) {
          setPaymentUrl(data.paymentUrl);
        } else {
          showNotification("Có lỗi xảy ra trong quá trình thanh toán", "error");
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Lỗi thanh toán:", error);
        showNotification(
          "Đã xảy ra lỗi kết nối, vui lòng thử lại sau",
          "error"
        );
      });
  };

  const showNotification = (message: string, type: "success" | "error") => {
    // This would be implemented with a toast library like react-toastify
    alert(message);
  };

  // Redirect to payment page if URL is available
  if (paymentUrl) {
    window.location.href = paymentUrl;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <section className="purchase-confirmation-section">
      <div className="container">
        <div className="confirmation-header">
          <h2>Xác nhận đơn hàng</h2>
          <p>Vui lòng kiểm tra thông tin khóa học và phương thức thanh toán</p>
        </div>

        <div className="confirmation-content">
          <div className="row">
            {/* Left Column: Course Info */}
            <div className="col-lg-8">
              <div className="card course-info-card">
                <div className="card-header">
                  <h4>Thông tin khóa học</h4>
                </div>
                <div className="card-body">
                  {cart.length > 0 ? (
                    <div className="course-list">
                      {cart.map((item, index) => (
                        <div className="course-item" key={index}>
                          <div className="course-image">
                            <img src={item.image} alt={item.title} />
                          </div>
                          <div className="course-details">
                            <h5>{item.title}</h5>
                            <p className="course-price">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-cart">
                      <i className="fa fa-shopping-cart"></i>
                      <p>Giỏ hàng trống</p>
                      <a href="/courses" className="btn btn-primary">
                        Xem khóa học
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary and Payment */}
            <div className="col-lg-4">
              <div className="card order-summary-card">
                <div className="card-headerr">
                  <h4>Tóm tắt đơn hàng</h4>
                </div>
                <div className="card-body">
                  {userInfo && (
                    <div className="customer-info">
                      <div className="info-item">
                        <span className="label">Họ tên:</span>
                        <span className="value">{userInfo.fullname}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Email:</span>
                        <span className="value">{userInfo.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Số điện thoại:</span>
                        <span className="value">{userInfo.phone}</span>
                      </div>
                    </div>
                  )}

                  <div className="divider"></div>

                  <div className="price-details">
                    <div className="price-row">
                      <span>Số lượng khóa học:</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="price-row">
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="price-row">
                      <span>Giảm giá:</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="price-row total">
                      <span>Tổng thanh toán:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card payment-methods-card">
                <div className="card-header">
                  <h4>Phương thức thanh toán</h4>
                </div>
                <div className="card-body">
                  <p className="text-center">
                    Vui lòng chọn phương thức thanh toán
                  </p>

                  <div className="payment-options">
                    <button
                      className="payment-button vnpay"
                      onClick={() => handlePayment("VNPAY")}
                      disabled={isLoading}
                    >
                      <div className="payment-icon">
                        <img
                          src="../../assets/images/logo/VNPAY_Logo.jpg"
                          alt="VNPay"
                        />
                      </div>
                      <div className="payment-text">
                        <p>Thanh toán qua VNPay</p>
                      </div>
                    </button>

                    <button
                      className="payment-button momo"
                      onClick={() => handlePayment("MOMO")}
                      disabled={isLoading}
                    >
                      <div className="payment-icon">
                        <img
                          src="../../assets/images/logo/logo-momo.jpg"
                          alt="MoMo"
                        />
                      </div>
                      <div className="payment-text">
                        <p>Thanh toán qua MoMo</p>
                      </div>
                    </button>

                    <button
                      className="payment-button wallet"
                      onClick={() => handlePayment("WALLET")}
                      disabled={isLoading}
                    >
                      <div className="payment-icon">
                        <img
                          src="../../assets/images/logo/logo-vi.png"
                          alt="Ví điện tử"
                        />
                      </div>
                      <div className="payment-text">
                        <p>Thanh toán qua Ví</p>
                        <p className="balance">
                          Số dư: {formatCurrency(500000)}
                        </p>
                      </div>
                    </button>
                  </div>

                  {isLoading && (
                    <div className="loading-indicator">
                      <div className="spinner"></div>
                      <p>Đang xử lý thanh toán...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConfirmPurchase;
