import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";
import styles from "./ConfirmPuchase.module.css";

interface UserProfile {
  fullname: string;
  email: string;
  password: string | null;
  phone: string | null;
  image: string | null;
  birthday: string;
  gender: string;
  createdAt: string;
  updatedAt: string;
  roleId: number;
}

interface UserApiResponse {
  status: number;
  message: string;
  data: UserProfile;
}

interface CartItem {
  cartId: number;
  cartItemId: number;
  courseId: number | null;
  testId: number | null;
  courseBundleId: number | null;
  price: number;
  cost: number;
  discount: number;
  name: string;
  type: string;
  image: string;
  timestamp: string;
}

interface CartApiResponse {
  status: number;
  message: string;
  data: CartItem[];
}

export interface AuthData {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}

function ConfirmPurchase() {
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchUserInfo();
    fetchCart();

  }, []);

  const getUserData = (): AuthData | null => {
    const authData = localStorage.getItem("authData");
    if (!authData) return null;

    try {
      return JSON.parse(authData) as AuthData;
    } catch (error) {
      console.error("Lỗi khi lấy authData:", error);
      return null;
    }
  };

  const getToken = (): string | null => {
    return localStorage.getItem("authToken");
  };

  const fetchUserInfo = async () => {
    try {
      const storedAuthData = localStorage.getItem("authData");
      const token = getToken();

      if (storedAuthData && token) {
        const parsedAuthData = JSON.parse(storedAuthData);

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/account/user/${parsedAuthData.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không thể tải thông tin người dùng");
        }

        const responseData: UserApiResponse = await response.json();

        if (responseData.status === 200 && responseData.data) {
          setUserInfo(responseData.data);
        } else {
          throw new Error(responseData.message || "Lỗi khi tải thông tin người dùng");
        }
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
      setError(error instanceof Error ? error.message : "Không thể tải thông tin người dùng");
    }
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);

      // Try to get cart data from sessionStorage first
      const cartCheckoutData = sessionStorage.getItem("cartcheckout");

      if (cartCheckoutData) {
        const checkoutData = JSON.parse(cartCheckoutData);

        // Use the cart items directly from sessionStorage
        if (checkoutData.items && checkoutData.items.length > 0) {
          setCart(checkoutData.items);

          // Calculate prices from the stored data
          const total = checkoutData.totalAmount ||
            checkoutData.items.reduce((acc: number, item: CartItem) => acc + item.price, 0);

          const originalTotal = checkoutData.items.reduce(
            (acc: number, item: CartItem) => acc + item.cost,
            0
          );

          const discount = originalTotal - total;

          setTotalPrice(total);
          setOriginalPrice(originalTotal);
          setDiscountAmount(discount);

          setIsLoading(false);
          return;
        }
      }

      // Fall back to API if no data in sessionStorage
      const userData = getUserData();
      const token = getToken();

      if (!userData || !token) {
        setError("Bạn cần đăng nhập để xem giỏ hàng");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${userData.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải giỏ hàng");
      }

      const responseData: CartApiResponse = await response.json();

      if (responseData.status === 200 && responseData.data) {
        // Use the cart items directly as they match our interface
        setCart(responseData.data);

        // Calculate prices
        const total = responseData.data.reduce(
          (acc, item) => acc + item.price,
          0
        );

        const originalTotal = responseData.data.reduce(
          (acc, item) => acc + item.cost,
          0
        );

        const discount = originalTotal - total;

        setTotalPrice(total);
        setOriginalPrice(originalTotal);
        setDiscountAmount(discount);
      } else {
        throw new Error(responseData.message || "Dữ liệu giỏ hàng không hợp lệ");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải giỏ hàng");
      console.error("Error fetching cart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (method: string) => {
    if (method === "VNPAY") {
      showNotification("Thanh toán qua VNPay đang phát triển, vui lòng chọn phương thức thanh toán khác.", "error");
      return;
    } else if (method === "MOMO") {
      showNotification("Thanh toán qua MoMo đang phát triển, vui lòng chọn phương thức thanh toán khác.", "error");
      return;
    }
    // else if (method === "WALLET") {
    //   showNotification("Thanh toán qua Ví cá nhân đang phát triển, vui lòng chọn phương thức thanh toán khác.", "error");
    //   return;
    // }
    setSelectedPayment(method);
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification("Bạn cần đăng nhập để thực hiện thanh toán.", "error");
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem("paymentMethod", method);

    // Get user email for the payment
    const userData = getUserData();
    if (!userData) {
      setIsLoading(false);
      showNotification("Không thể lấy thông tin người dùng", "error");
      return;
    }

    // Construct the items array from cart data
    const items = cart.map(item => ({
      itemid: item.courseId || item.testId || item.courseBundleId || item.cartItemId,
      itemname: item.name,
      itemprice: item.price,
      itemquantity: 1
    }));

    // Prepare request body
    const requestBody: any = {
      appUser: userInfo?.email || userData.email,
      amount: totalPrice,
      description: `Payment ${userInfo?.email || userData.email}`,
      bankCode: "",
      items: items,
      embedData: {
        redirecturl: " http://localhost:3001/thanh-toan/logic"// Redirect back to current origin
      },
      callback_url: "http://103.166.143.198:8080/api/payment/zalo-callback"
    };
    sessionStorage.setItem("totalPrice", totalPrice.toString());

    // Set preferred payment method based on selected method
    if (method === "ZALOPAY") {
      requestBody.embedData.preferred_payment_method = [
        "domestic_card",
        "account"
      ];
    } else if (method === "ZALOQR") {
      requestBody.embedData.preferred_payment_method = [
        "zalopay_wallet"
      ];
    } else if (method === "VNPAY") {
      // Use existing VNPAY endpoint with GET request
      const paymentEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/payment/vnpay/vn-pay?amount=${totalPrice}&bankCode=NCB`;

      fetch(paymentEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setIsLoading(false);
          if (data && data.code === "ok" && data.paymentUrl) {
            window.location.href = data.paymentUrl;
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

      return;
    } else if (method === "MOMO") {
      // Use existing MOMO endpoint with GET request      
      const paymentEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/payment/momo/create?amount=${totalPrice}`;

      fetch(paymentEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setIsLoading(false);
          if (data && data.code === "ok" && data.paymentUrl) {
            window.location.href = data.paymentUrl;
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

      return;
    } else if (method === "WALLET") {
      try {
        let walletId = sessionStorage.getItem("walletId");
        const paymentEndpoint = `${process.env.REACT_APP_SERVER_HOST}/api/payments/v2/init-wallet?walletId=${walletId}`;

        const response = await fetch(paymentEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          setIsLoading(false);
          showNotification("Có lỗi xảy ra trong quá trình thanh toán", "error");
          return;
        }

        const responseData = await response.json();
        setIsLoading(false);

        if (responseData.status === 200) {
          // showNotification(responseData.message || "Thanh toán thành công", "success");
          const transactionId = responseData.data?.transactionId;
          if (transactionId) {
            sessionStorage.setItem("transactionId", transactionId);
          }
          window.location.href = "/thanh-toan/logic";
        } else {
          showNotification(responseData.message || "Có lỗi xảy ra trong quá trình thanh toán", "error");
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Lỗi thanh toán:", error);
        showNotification("Đã xảy ra lỗi kết nối, vui lòng thử lại sau", "error");
      }
      return;
    }
    // For ZaloPay payment methods, use the new API
    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/payment/create-order-web`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        if (data && data.return_code === 1 && data.order_url) {
          // For ZaloPay, use order_url instead of paymentUrl
          window.location.href = data.order_url;
        } else {
          // Use the API's error message if available
          const errorMessage = data.return_message || data.sub_return_message || "Có lỗi xảy ra trong quá trình thanh toán";
          showNotification(errorMessage, "error");
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


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={() => window.location.href = "/dang-nhap"} className="btn btn-primary">
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <section className={styles.purchaseConfirmationSection}>
      <div className="container">
        <div className={styles.confirmationHeader + " text-center mb-4"}>
          <h2 className="mb-2">Xác nhận đơn hàng</h2>
          <p className="text-secondary">Vui lòng kiểm tra thông tin đơn hàng và phương thức thanh toán</p>
        </div>

        <div className={styles.confirmationContent}>
          <div className="row">
            {/* Left Column: Course Info */}
            <div className="col-lg-8">
              <div className={styles.card + " mb-4"}>
                <div className={styles.cardHeader}>
                  <h5 className="mb-0">Thông tin đơn hàng</h5>
                </div>
                <div className={styles.cardBody}>
                  {cart.length > 0 ? (
                    <div className={styles.courseList}>
                      {cart.map((item) => (
                        <div className={styles.courseItem + " d-flex"} key={item.cartItemId}>
                          <div className={styles.courseImage}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="img-fluid"
                            />
                          </div>
                          <div className={styles.courseDetails + " flex-grow-1 ms-3"}>
                            <h5 className="mb-1">{item.name}</h5>
                            <div className="d-flex align-items-center mb-1">
                              <span className={`${styles.typeBadge} ${item.type.toLowerCase() === "course" ? styles.course : item.type.toLowerCase() === "combo" ? styles.combo : styles.test}`}>
                                {item.type === "COURSE" ? "Khóa học" :
                                  item.type === "COMBO" ? "Combo" : "Đề thi"}
                              </span>
                            </div>
                            <div className="d-flex align-items-center">
                              <span className={styles.coursePrice}>{formatCurrency(item.price)}</span>
                              {item.discount > 0 && (
                                <>
                                  <span className="text-decoration-line-through text-muted ms-2">
                                    {formatCurrency(item.cost)}
                                  </span>
                                  <span className={styles.discountBadge}>
                                    -{item.discount}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyCart + " py-4"}>
                      <i className="fa fa-shopping-cart fa-3x mb-3 text-muted"></i>
                      <p>Giỏ hàng trống</p>
                      <a href="/khoa-hoc" className="btn btn-primary">
                        Xem khóa học
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary and Payment */}
            <div className="col-lg-4">
              <div className={styles.card + " mb-4"}>
                <div className={styles.cardHeader}>
                  <h5 className="mb-0">Tóm tắt đơn hàng</h5>
                </div>
                <div className={styles.cardBody}>
                  {userInfo && (
                    <div className={styles.customerInfo + " mb-3"}>
                      <div className={styles.infoItem + " d-flex justify-content-between mb-2"}>
                        <span className="text-muted">Họ tên:</span>
                        <span className="fw-medium">{userInfo.fullname}</span>
                      </div>
                      <div className={styles.infoItem + " d-flex justify-content-between mb-2"}>
                        <span className="text-muted">Email:</span>
                        <span className="fw-medium">{userInfo.email}</span>
                      </div>
                      <div className={styles.infoItem + " d-flex justify-content-between"}>
                        <span className="text-muted">Số điện thoại:</span>
                        <span className="fw-medium">{userInfo.phone || "Chưa cung cấp"}</span>
                      </div>
                    </div>
                  )}

                  <hr className="my-3" />

                  <div className={styles.priceDetails}>
                    <div className={styles.priceRow + " mb-2"}>
                      <span>Số lượng khóa học:</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className={styles.priceRow + " mb-2"}>
                      <span>Tạm tính:</span>
                      <span>{formatCurrency(originalPrice)}</span>
                    </div>
                    <div className={styles.priceRow + " mb-3"}>
                      <span>Giảm giá:</span>
                      <span className="text-danger">-{formatCurrency(discountAmount)}</span>
                    </div>
                    <div className={styles.priceRow + " " + styles.total + " fw-bold"}>
                      <span>Tổng thanh toán:</span>
                      <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h5 className="mb-0">Phương thức thanh toán</h5>
                </div>
                <div className={styles.cardBody}>
                  <p className="text-center mb-3">
                    Vui lòng chọn phương thức thanh toán
                  </p>

                  <div className={styles.paymentOptions}>
                    {/* <button
                      className={`${styles.paymentButton} ${styles.vnpay} ${selectedPayment === "VNPAY" ? styles.selected : ""} mb-3 w-100 p-3 rounded d-flex align-items-center`}
                      onClick={() => handlePayment("VNPAY")}
                      disabled={isLoading}
                    >
                      <div className={styles.paymentIcon + " me-3"} style={{ width: "40px", height: "40px" }}>
                        <img
                          src="../../assets/images/logo/VNPAY_Logo.jpg"
                          alt="VNPay"
                          className="img-fluid"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.paymentText}>
                        <p className="mb-0">Thanh toán qua VNPay</p>
                      </div>
                    </button>

                    <button
                      className={`${styles.paymentButton} ${styles.momo} ${selectedPayment === "MOMO" ? styles.selected : ""} mb-3 w-100 p-3 rounded d-flex align-items-center`}
                      onClick={() => handlePayment("MOMO")}
                      disabled={isLoading}
                    >
                      <div className={styles.paymentIcon + " me-3"} style={{ width: "40px", height: "40px" }}>
                        <img
                          src="../../assets/images/logo/logo-momo.jpg"
                          alt="MoMo"
                          className="img-fluid"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.paymentText}>
                        <p className="mb-0">Thanh toán qua MoMo</p>
                      </div>
                    </button> */}

                    <button
                      className={`${styles.paymentButton} ${styles.zalopay} ${selectedPayment === "ZALOPAY" ? styles.selected : ""} mb-3 w-100 p-3 rounded d-flex align-items-center`}
                      onClick={() => handlePayment("ZALOPAY")}
                      disabled={isLoading}
                    >
                      <div className={styles.paymentIcon + " me-3"} style={{ width: "40px", height: "40px" }}>
                        <img
                          src="../../assets/images/logo/atm.jpg"
                          alt="ZaloPay"
                          className="img-fluid"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.paymentText}>
                        <p className="mb-0">Thanh toán qua thẻ ATM</p>
                      </div>
                    </button>

                    <button
                      className={`${styles.paymentButton} ${styles.zaloqr} ${selectedPayment === "ZALOQR" ? styles.selected : ""} mb-3 w-100 p-3 rounded d-flex align-items-center`}
                      onClick={() => handlePayment("ZALOQR")}
                      disabled={isLoading}
                    >
                      <div className={styles.paymentIcon + " me-3"} style={{ width: "40px", height: "40px" }}>
                        <img
                          src="../../assets/images/logo/zalopay.jpg"
                          alt="ZaloPay QR"
                          className="img-fluid"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.paymentText}>
                        <p className="mb-0">ZaloPay - Quét mã QR</p>

                      </div>
                    </button>
                    <button
                      className={`${styles.paymentButton} ${styles.zaloqr} ${selectedPayment === "WALLET" ? styles.selected : ""} mb-3 w-100 p-3 rounded d-flex align-items-center`}
                      onClick={() => handlePayment("WALLET")}
                      disabled={isLoading}
                    >
                      <div className={styles.paymentIcon + " me-3"} style={{ width: "40px", height: "40px" }}>
                        <img
                          src="../../assets/images/logo/wallet.jpg"
                          alt="Wallet"
                          className="img-fluid"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className={styles.paymentText}>
                        <p className="mb-0">Ví cá nhân</p>

                      </div>
                    </button>
                  </div>

                  {isLoading && (
                    <div className={styles.loadingIndicator + " py-3"}>
                      <div className={styles.spinner + " mb-2"}></div>
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
