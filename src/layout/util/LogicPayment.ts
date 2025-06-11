import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 for popup confirmation

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  idTacGia?: number;
}

interface AuthData {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}

interface PaymentDetail {
  id: null;
  courseId: number | null;
  testId: number | null;
  courseBundleId: number | null;
  price: number;
  type: string; // "COURSE" | "EXAM" | "COMBO" | "WALLET" | "SUBSCRIPTION"
}

interface CartCheckout {
  id: null;
  paymentDate: string;
  subTotalPayment: number;
  totalPayment: number;
  totalDiscount: number;
  discountValue: number;
  paymentMethod: string;
  transactionId: string;
  accountId: number;
  paymentType: string; // "WALLET" | "SUBSCRIPTION" | "PRODUCT"
  note: string;
  paymentDetails: PaymentDetail[];
  createdAt: string;
  updatedAt: string;
}

export const LogicPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let didEffectRun = useRef(false);
  let method = sessionStorage.getItem("paymentMethod");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const clearSessionData = () => {
    // Save lecturer IDs to localStorage if available in cart
    const cartData = sessionStorage.getItem("cart");

    if (cartData) {
      const cartItems = JSON.parse(cartData);
      if (Array.isArray(cartItems)) {
        const idTacGiaArray = cartItems
          .filter(item => item.idTacGia)
          .map(item => item.idTacGia);

        if (idTacGiaArray.length > 0) {
          console.log("Saving lecturer IDs:", idTacGiaArray);
          localStorage.setItem("idTacGiaArray", JSON.stringify(idTacGiaArray));
        }
      }
    }

    // Clear session data
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("paymentMethod");
    sessionStorage.removeItem("cartcheckout");
    sessionStorage.removeItem("transactionId");
    sessionStorage.removeItem("totalPrice");
  };

  const getAuthDataFromLocalStorage = (): AuthData | null => {
    const authFromStorage = localStorage.getItem("authData");
    return authFromStorage ? JSON.parse(authFromStorage) : null;
  };
  const payment = async () => {
    let method = sessionStorage.getItem("paymentMethod");
    if (method === "WALLET") {
      // Show confirmation popup for wallet payments
      showWalletConfirmation();
    } else {
      processPayment();
    }
  }
  const processPaymentWallet = async () => {
    try {
      let transactionId = sessionStorage.getItem("transactionId");
      // Get cart checkout data from sessionStorage
      const cartCheckoutData = sessionStorage.getItem("cartcheckout");

      if (transactionId == null) {
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }
      if (!cartCheckoutData) {
        console.error("Cart checkout data not found in session storage");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }
      // Parse cart checkout data to get paymentDetails
      const cartCheckout = JSON.parse(cartCheckoutData);
      console.log("Cart checkout data:", cartCheckout);

      // Get auth data for account ID
      const authData = getAuthDataFromLocalStorage();
      if (!authData) {
        console.error("Authentication data not found");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Get current time for timestamps with explicit year
      const now = new Date();
      const currentTime = now.toISOString();
      console.log("Current timestamp:", currentTime);
      const totalPrice = sessionStorage.getItem("totalPrice");

      // Map items from cartcheckout to paymentDetails format
      const paymentDetails = cartCheckout.items ? cartCheckout.items.map((item: any) => {
        return {
          id: null,
          courseId: item.courseId,
          testId: item.testId,
          courseBundleId: item.courseBundleId,
          price: item.price,
          type: item.type // "COURSE", "EXAM", "COMBO", etc.
        };
      }) : [];

      // Construct the request body as specified
      const requestBody: any = {
        paymentDate: currentTime,
        subTotalPayment: parseInt(totalPrice!),
        totalPayment: parseInt(totalPrice!),
        totalDiscount: 0,
        discountValue: 0,
        paymentMethod: "WALLET",
        transactionId: transactionId,
        accountId: authData.id,
        paymentType: "PRODUCT",
        note: `Thanh toán thành công cho đơn hàng #${transactionId}`,
        paymentDetails: paymentDetails, // Use the mapped items
        createdAt: currentTime,
        updatedAt: currentTime
      };

      console.log("Sending payment data to API:", requestBody);

      // Get authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Authentication token not found");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Call API to process payment
      const paymentResponse = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/v2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("Lỗi khi xử lý thanh toán:", errorData);
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Store payment response for PaymentSuccess component
      const responseData = await paymentResponse.json();

      // Ensure the payment method is set to WALLET
      if (responseData.data) {
        responseData.data.paymentMethod = "WALLET";
      } else if (responseData) {
        responseData.paymentMethod = "WALLET";
      }

      // Save payment data to localStorage for PaymentSuccess component
      localStorage.setItem("totalPayment", JSON.stringify(responseData.data || responseData));
      localStorage.setItem("paymentMethod", "WALLET");

      // Clear session data and redirect to success page immediately
      clearSessionData();
      navigate("/khoa-hoc/thanh-toan/success");

    } catch (error) {
      console.error("Error processing payment:", error);
      navigate("/khoa-hoc/thanh-toan/fail");
    }
  };
  const processPayment = async () => {
    // Check if we have URL parameters from ZaloPay callback
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get("status");
    const amount = urlParams.get("amount") || "0";
    const appTransId = urlParams.get("apptransid") || "";
    const discountamount = urlParams.get("discountamount") || "0";

    // If no status parameter, not a ZaloPay callback
    if (!status) {
      console.log("No status parameter found in URL");
      navigate("/khoa-hoc/thanh-toan/fail");
      return;
    }

    console.log("Payment callback received with status:", status);
    console.log("Transaction ID:", appTransId);
    console.log("Amount:", amount);

    // Determine if payment was successful (status=1) or failed (status=0)
    if (status !== "1") {
      console.error("Payment failed with status:", status);
      navigate("/khoa-hoc/thanh-toan/fail");
      return;
    }

    try {
      // Get cart checkout data from sessionStorage
      const cartCheckoutData = sessionStorage.getItem("cartcheckout");

      if (!cartCheckoutData) {
        console.error("Cart checkout data not found in session storage");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Parse cart checkout data to get paymentDetails
      const cartCheckout = JSON.parse(cartCheckoutData);
      console.log("Cart checkout data:", cartCheckout);

      // Get auth data for account ID
      const authData = getAuthDataFromLocalStorage();
      if (!authData) {
        console.error("Authentication data not found");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Get current time for timestamps with explicit year
      const now = new Date();
      const currentTime = now.toISOString();
      console.log("Current timestamp:", currentTime);

      // Map items from cartcheckout to paymentDetails format
      const paymentDetails = cartCheckout.items ? cartCheckout.items.map((item: any) => {
        return {
          id: null,
          courseId: item.courseId,
          testId: item.testId,
          courseBundleId: item.courseBundleId,
          price: item.price,
          type: item.type // "COURSE", "EXAM", "COMBO", etc.
        };
      }) : [];

      // Construct the request body as specified
      const requestBody: any = {
        id: null,
        paymentDate: currentTime,
        subTotalPayment: parseInt(amount),
        totalPayment: parseInt(amount),
        totalDiscount: parseInt(discountamount),
        discountValue: parseInt(discountamount),
        paymentMethod: "Zalo Pay",
        transactionId: appTransId,
        accountId: authData.id,
        paymentType: "PRODUCT",
        note: `Thanh toán thành công cho đơn hàng #${appTransId}`,
        paymentDetails: paymentDetails, // Use the mapped items
        createdAt: currentTime,
        updatedAt: currentTime
      };

      console.log("Sending payment data to API:", requestBody);

      // Get authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Authentication token not found");
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Call API to process payment
      const paymentResponse = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/v2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error("Lỗi khi xử lý thanh toán:", errorData);
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }

      // Store payment response for PaymentSuccess component
      const responseData = await paymentResponse.json();
      console.log("Thanh toán thành công:", responseData);

      // Save payment data to localStorage for PaymentSuccess component
      localStorage.setItem("totalPayment", JSON.stringify(responseData.data || responseData));

      // Clear session data and redirect to success page immediately
      clearSessionData();
      navigate("/khoa-hoc/thanh-toan/success");

    } catch (error) {
      console.error("Error processing payment:", error);
      navigate("/khoa-hoc/thanh-toan/fail");
    }
  };

  const showWalletConfirmation = async () => {
    try {
      const totalPrice = sessionStorage.getItem("totalPrice");
      const walletId = sessionStorage.getItem("walletId");
      const token = localStorage.getItem("authToken");
      const userData = getAuthDataFromLocalStorage();

      if (!userData || !token) {
        navigate("/khoa-hoc/thanh-toan/fail");
        return;
      }
      let balance: any;


      // Fetch wallet balance
      try {
        const walletResponse = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/wallet/info-simple/${userData.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.data) {
            setWalletBalance(walletData.data.balance || 0);
            balance = walletData.data.balance;
          }
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }

      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(parseInt(totalPrice || "0"));

      const formattedBalance = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(balance);

      // Check if wallet balance is sufficient
      const totalPriceValue = parseInt(totalPrice || "0");
      console.log("walletBalance", walletBalance);
      console.log("totalPriceValue", totalPriceValue);



      if (balance < totalPriceValue) {
        // Show insufficient funds alert
        await Swal.fire({
          title: 'Số dư không đủ',
          html: `<p>Số dư ví của bạn <strong>${formattedBalance}</strong> không đủ để thanh toán <strong>${formattedPrice}</strong>.</p>
                 <p>Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức thanh toán khác.</p>`,
          icon: 'error',
          confirmButtonText: 'Quay lại giỏ hàng',
        });

        clearSessionData();
        navigate("/gio-hang");
        return;
      }

      // Show SweetAlert2 confirmation dialog
      const result = await Swal.fire({
        title: 'Xác nhận thanh toán',
        html: `<p>Bạn có chắc chắn muốn thanh toán <strong>${formattedPrice}</strong> từ ví cá nhân không?</p>
               <p>Số dư hiện tại: <strong>${formattedBalance}</strong></p>
               <p>Số dư còn lại sau khi thanh toán: <strong>${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(balance - totalPriceValue)}</strong></p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        // User confirmed, proceed with payment
        processPaymentWallet();
      } else {
        // User canceled, navigate back to cart
        clearSessionData();
        navigate("/gio-hang");
      }
    } catch (error) {
      console.error("Error showing wallet confirmation:", error);
      navigate("/khoa-hoc/thanh-toan/fail");
    }
  };

  useEffect(() => {
    // Only run once
    if (!didEffectRun.current) {
      didEffectRun.current = true;

      payment();
    }
  }, [location.search]);

  return null;
};
