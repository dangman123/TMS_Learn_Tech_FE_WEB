import React, { useEffect, useState } from "react";
import "./PaymentStyles.css"; // We'll create a new CSS file
import { push, ref, set } from "firebase/database";
import { database } from "../util/fucntion/firebaseConfig";

interface PaymentData {
  id: number;
  payment_date: string;
  total_payment: number;
  paymentMethod: string;
  account_id: number;
  courses: CourseItem[];
}

interface CourseItem {
  id: number;
  title: string;
  price: number;
  image: string;
  instructor: string;
}

function PaymentSuccess() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Animation effect on mount
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Get actual payment data or use mock data for demo
    const paymentDataString = localStorage.getItem("totalPayment");

    if (paymentDataString) {
      try {
        const paymentDataParsed = JSON.parse(paymentDataString);
        setPaymentData(paymentDataParsed);
        const userId = paymentDataParsed.account_id.toString();
        const idTacGiaArrayString = localStorage.getItem("idTacGiaArray");

        if (idTacGiaArrayString) {
          const idTacGiaArray = JSON.parse(idTacGiaArrayString);
          const processedUserIds = new Set();

          const conversationPromises = idTacGiaArray
            .filter((otherUserId: any) => {
              if (!processedUserIds.has(otherUserId)) {
                processedUserIds.add(otherUserId);
                return true;
              }
              return false;
            })
            .map((otherUserId: any) => startConversation(userId, otherUserId));

          Promise.all(conversationPromises)
            .then(() => {
              console.log("Tất cả cuộc trò chuyện đã được bắt đầu.");
            })
            .catch((error) => {
              console.error("Lỗi khi bắt đầu cuộc trò chuyện:", error);
            })
            .finally(() => {
              setIsLoading(false);
            });

          localStorage.removeItem("idTacGiaArray");
        } else {
          console.log("Không tìm thấy mảng idTacGia trong localStorage.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi xử lý dữ liệu thanh toán:", error);
        setIsLoading(false);
      }
    } else {
      // Use mock data for demo/preview
      setPaymentData({
        id: 10243859,
        payment_date: new Date().toISOString(),
        total_payment: 2490000,
        paymentMethod: "VNPAY",
        account_id: 12345,
        courses: [
          {
            id: 1,
            title: "Lập trình React.js Nâng cao",
            price: 1490000,
            image: "../../assets/images/courses/react-advanced.jpg",
            instructor: "Nguyễn Thành Long",
          },
          {
            id: 2,
            title: "Master JavaScript từ cơ bản đến chuyên sâu",
            price: 1000000,
            image: "../../assets/images/courses/javascript-master.jpg",
            instructor: "Trần Minh Hiếu",
          },
        ],
      });
      setIsLoading(false);
    }
  }, []);

  const createConversation = async (
    userId: string,
    otherUserId: string,
    message: string
  ) => {
    // Create conversation object
    const newConversation = {
      lastMessage: message,
      participants: [otherUserId.toString(), userId.toString()],
      timestamp: new Date().toISOString(),
    };

    try {
      // Create random ID for new conversation
      const conversationsRef = ref(database, "conversations");
      const newConversationRef = push(conversationsRef);
      await set(newConversationRef, newConversation);

      // Create first message for conversation
      const newMessage = {
        senderId: userId.toString(),
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Save message to Firebase
      const messagesRef = ref(database, `messages/${newConversationRef.key}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, newMessage);

      console.log("Conversation and message created successfully!");
    } catch (error) {
      console.error("Error creating conversation or message:", error);
    }
  };

  const startConversation = (userId: string, otherUserId: string) => {
    const initialMessage = "Xin chào! Chào mừng bạn đến với khoá học của tôi!";
    return createConversation(userId, otherUserId, initialMessage);
  };

  if (isLoading) {
    return (
      <div className="compact-payment-loading">
        <div className="spinner"></div>
        <p>Đang xử lý thanh toán...</p>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="compact-payment-error">
        <i className="fa fa-exclamation-triangle"></i>
        <p>Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const formattedTotalPayment = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(paymentData.total_payment);

  const formattedDate = new Date(paymentData.payment_date).toLocaleDateString(
    "vi-VN",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <section className="compact-payment-result-section payment-success">
      <div className="container">
        <div className="compact-payment-result-content">
          <div className="compact-result-header">
            <div className="compact-result-icon success-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p className="subtitle">
              Cảm ơn bạn đã hoàn tất giao dịch. Khóa học đã sẵn sàng!
            </p>
          </div>

          <div className="compact-order-details">
            <div className="compact-detail-item">
              <span className="label">Mã đơn hàng:</span>
              <span className="value">{paymentData.id}</span>
            </div>

            <div className="compact-detail-item">
              <span className="label">Phương thức:</span>
              <span className="value payment-method">
                {paymentData.paymentMethod === "VNPAY" && (
                  <img
                    src="../../assets/images/logo/VNPAY_Logo.jpg"
                    alt="VNPAY"
                    className="payment-icon"
                  />
                )}
                {paymentData.paymentMethod === "MOMO" && (
                  <img
                    src="../../assets/images/logo/logo-momo.jpg"
                    alt="MoMo"
                    className="payment-icon"
                  />
                )}
                {paymentData.paymentMethod}
              </span>
            </div>

            <div className="compact-detail-item">
              <span className="label">Ngày:</span>
              <span className="value">{formattedDate}</span>
            </div>

            <div className="compact-detail-item total">
              <span className="label">Tổng:</span>
              <span className="value total-amount">
                {formattedTotalPayment}
              </span>
            </div>
          </div>

          <div className="compact-next-actions">
            <a href="/khoa-hoc-cua-toi" className="compact-btn btn-primary">
              <i className="fa fa-play-circle"></i> Bắt đầu học
            </a>
            <a href="/" className="compact-btn btn-outline">
              <i className="fa fa-home"></i> Trang chủ
            </a>
          </div>

          <div className="compact-additional-info">
            <p>
              <i className="fa fa-envelope"></i> Chi tiết đã được gửi qua email
            </p>
            <p>
              <i className="fa fa-question-circle"></i> Cần hỗ trợ?{" "}
              <a href="/lien-he">Liên hệ</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentSuccess;
