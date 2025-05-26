import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface AuthData {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}

export const LogicPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  let didEffectRun = useRef(false);
  const getCartFromSession = (): CartItem[] => {
    const cartFromStorage = sessionStorage.getItem("cart");
    return cartFromStorage ? JSON.parse(cartFromStorage) : [];
  };

  const getAuthDataFromLocalStorage = (): AuthData | null => {
    const authFromStorage = localStorage.getItem("authData");
    return authFromStorage ? JSON.parse(authFromStorage) : null;
  };

  const getPaymentMethodFromSession = (): string | null => {
    return sessionStorage.getItem("paymentMethod");
  };

  const clearSessionData = () => {
    // Lấy dữ liệu từ sessionStorage và parse thành mảng (nếu có)
    const cartData = sessionStorage.getItem("cart");

    if (cartData) {
      // Parse chuỗi JSON thành đối tượng hoặc mảng
      const cartItems = JSON.parse(cartData);
      console.log(cartData);
      // Kiểm tra nếu cartItems là mảng và chứa đối tượng có trường idTacGia
      if (Array.isArray(cartItems)) {
        const idTacGiaArray = cartItems.map(
          (item: { idTacGia: number }) => item.idTacGia
        );
        console.log(idTacGiaArray);

        // Lưu idTacGiaArray vào localStorage
        localStorage.setItem("idTacGiaArray", JSON.stringify(idTacGiaArray));
      } else {
        console.error("Cart data is not in the correct format.");
      }
    }

    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("paymentMethod");
  };

  const handlePayment = async () => {
    const cart = getCartFromSession();
    const authData = getAuthDataFromLocalStorage();
    const paymentMethod = getPaymentMethodFromSession();

    if (!authData) {
      console.error("Người dùng chưa đăng nhập.");
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      console.error("Giỏ hàng trống.");
      setLoading(false);
      return;
    }

    const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);

    // console.log(totalAmount);
    // console.log(authData);
    // console.log(cart);

    try {
      const token = localStorage.getItem("authToken");

      // 1. Gọi API thanh toán
      const paymentResponse = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_date: new Date().toISOString(),
            total_payment: totalAmount,
            paymentMethod: paymentMethod,
            account_id: authData.id,
          }),
        }
      );

      const paymentData = await paymentResponse.json();
      localStorage.setItem("totalPayment", JSON.stringify(paymentData));
      if (!paymentResponse.ok) {
        console.error("Lỗi khi thanh toán:", paymentData);
        setLoading(false);
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // console.log("Thanh toán thành công:", paymentData);

      // 2. Gọi tất cả các API chi tiết thanh toán và đợi tất cả hoàn tất
      const paymentDetailPromises = cart.map((item) => {
        return fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/payment-details/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              price: item.price,
              courseTitle: item.title,
              paymentId: paymentData.id, // ID thanh toán vừa nhận được
              courseId: item.id,
            }),
          }
        ).then((response) => response.json());
      });

      // Đợi tất cả các chi tiết thanh toán được xử lý
      await Promise.all(paymentDetailPromises);

      console.log("Tất cả các chi tiết thanh toán đã được thêm thành công.");

      // 3. Sau khi chi tiết thanh toán hoàn thành, gọi API ghi danh vào khóa học
      const enrollPromises = cart.map((item) => {
        return fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/enroll?accountId=${authData.id}&courseId=${item.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((response) => response.text()); // Xử lý phản hồi dạng text
      });

      // Đợi tất cả các API ghi danh hoàn tất
      await Promise.all(enrollPromises);

      console.log("Tất cả các khóa học đã được ghi danh thành công.");

      // 4. Xóa dữ liệu trong sessionStorage và điều hướng tới trang success
      clearSessionData();
      setLoading(false);
      window.location.href = "/khoa-hoc/thanh-toan/success";
    } catch (error) {
      setLoading(false);
      window.location.href = "/khoa-hoc/thanh-toan/fail";
    }
  };

  useEffect(() => {
    // Kiểm tra nếu effect chưa chạy
    if (!didEffectRun.current) {
      didEffectRun.current = true; // Đánh dấu là đã chạy
      handlePayment();
    }
  }, []);

  return null;
};
