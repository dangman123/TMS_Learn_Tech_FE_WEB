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
function ConfirmPuchase() {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState(""); // URL thanh toán trả về từ API
  useEffect(() => {
    const storedAuthData = localStorage.getItem("authData");
    const token = localStorage.getItem("authToken");

    if (storedAuthData && token) {
      const parsedAuthData = JSON.parse(storedAuthData);

      // Sử dụng phương thức GET thay vì POST
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
          setUserInfo(data); // Cập nhật state với thông tin người dùng từ API
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

  // Gửi yêu cầu thanh toán VNPay
  const handleVnPayPayment = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Bạn cần đăng nhập để thực hiện thanh toán.");
      return;
    }
    sessionStorage.setItem("paymentMethod", "VNPAY");
    // Thực hiện gọi API với phương thức GET và token
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
        if (data && data.code === "ok" && data.paymentUrl) {
          setPaymentUrl(data.paymentUrl); // Lưu URL trả về từ VNPay
        } else {
          alert("Có lỗi xảy ra trong quá trình thanh toán");
        }
      })
      .catch((error) => {
        console.error("Lỗi thanh toán:", error);
      });
  };

  // Chuyển hướng tới trang thanh toán nếu có URL
  if (paymentUrl) {
    window.location.href = paymentUrl; // Chuyển hướng người dùng tới URL của VNPay
  }

  // if (!userInfo) {
  //   return <div>Loading...</div>; // Hiển thị Loading trong khi chờ dữ liệu
  // }

  return (
    <section className="courses-area pt-120 pb-120">
      <div className="container mt-4">
        {/* Phần 1: Hiển thị thông tin giỏ hàng */}
        <div className="section-border">
          <h3>Xác nhận thông tin khóa học</h3>
          {cart.length > 0 ? (
            cart.map((item, index) => (
              <div className="course-info" key={index}>
                <div className="details">
                  <h5>{item.title}</h5>
                  <p>
                    <strong>Thành tiền:</strong>{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.price)}
                  </p>
                </div>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "150px" }}
                />
              </div>
            ))
          ) : (
            <p>Giỏ hàng trống</p>
          )}
        </div>

        {/* Phần 2: Tóm tắt đơn hàng */}
        <div className="section-border order-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="row">
            <div className="col-md-6">
              <br />
              <p>
                <strong>Họ tên:</strong>{" "}
                {/* <span id="fullName">{userInfo.fullname}</span> */}
              </p>
              <br />
              <p>
                {/* <strong>Email:</strong> <span id="email">{userInfo.email}</span> */}
              </p>
              <br />
              <p>
                <strong>Số điện thoại:</strong>{" "}
                {/* <span id="phone">{userInfo.phone}</span> */}
              </p>
            </div>
            <div className="col-md-6">
              <div className="row">
                <div className="col-6">Tạm tính:</div>
                <div className="col-6 text-right">
                  <span id="subTotal">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-6">Giảm giá:</div>
                <div className="col-6 text-right">
                  <span id="discount">0đ</span>{" "}
                  {/* Giảm giá có thể điều chỉnh */}
                </div>
              </div>
              <div className="row">
                <div className="col-6">Tổng thanh toán:</div>
                <div className="col-6 text-right total-amount">
                  <span id="total">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng số lượng và tổng tiền */}
        <div className="total-info mb-50">
          <div className="total-items">
            <strong>Tổng số lượng khóa học:</strong> {cart.length}
          </div>
          <div className="total-amount">
            <strong>Tổng tiền:</strong>{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(totalPrice)}
          </div>
        </div>

        {/* Phần 3: Phương thức thanh toán */}
        <div className="section-border">
          <h3>Phương thức thanh toán</h3>
          <p className="text-center text-red">
            {" "}
            * Bạn vui lòng thanh toán khóa học bằng cách chọn hình thức dưới đây
            nhé
          </p>
          <div className="payment-method">
            {/* <div className="qr-item">
              <img
                src="../../assets/images/logo/MoMo_Logo.png"
                alt="QR Code Momo"
              />
              <div className="qr-label">MOMO</div>
            </div> */}
            <div className="qr-item">
              <button className="btn btn-primary" onClick={handleVnPayPayment}>
                <img
                  src="../../assets/images/logo/VNPAY_Logo.jpg"
                  alt="QR Code VNPay"
                  width="100px"
                  style={{
                    border: "1px solid #fff", //
                    marginRight: "10px",
                  }}
                />
                <p> Thanh toán qua VNPay</p>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleVnPayPayment}
                style={{
                  backgroundColor: "#a20063",
                  borderColor: "#a20063",
                  color: "#fff",
                }}
              >
                <img
                  src="../../assets/images/logo/logo-momo.jpg"
                  alt="QR Code MOMO"
                  width="100px"
                  style={{
                    border: "1px solid #fff", // Viền màu trắng
                    marginRight: "10px",
                  }}
                />
                <p>Thanh toán qua MoMo</p>
              </button>
              <button
                className="btn btn-primary"
                onClick={handleVnPayPayment}
                style={{
                  backgroundColor: "#f59d46",
                  borderColor: "#f59d46",
                  color: "#fff",
                }}
              >
                <img
                  src="../../assets/images/logo/logo-vi.png"
                  alt="ví"
                  width="100px"
                  style={{
                    border: "1px solid #fff", // Viền màu trắng
                    marginRight: "10px",
                  }}
                />
                <div>
                  <p style={{ margin: "20px 0 0" }}>Thanh toán qua Ví</p>
                  <p
                    style={{
                      fontSize: "14px",

                      color: "#fff",
                    }}
                  >
                    Số dư:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(500000)}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    </section>
  );
}

export default ConfirmPuchase;
