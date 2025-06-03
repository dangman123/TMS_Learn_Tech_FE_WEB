import React, { useEffect, useState } from "react";
import "./PaymentStyles.css"; // We'll create a new CSS file
import { push, ref, set } from "firebase/database";
import { database } from "../util/fucntion/firebaseConfig";

interface PaymentData {
  id: number;
  payment_date?: string;
  paymentDate?: string;
  total_payment?: number;
  totalPayment?: number;
  paymentMethod: string;
  account_id?: number;
  accountId?: number;
  courses?: CourseItem[];
  paymentDetails?: PaymentDetail[];
}

interface PaymentDetail {
  id: number | null;
  courseId: number | null;
  testId: number | null;
  courseBundleId: number | null;
  price: number;
  type: string;   // COURSE, EXAM, COMBO, WALLET, SUBSCRIPTION
  courseTitle?: string;
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

    // Get payment data from localStorage
    const paymentDataString = localStorage.getItem("totalPayment");

    if (paymentDataString) {
      try {
        const paymentDataParsed = JSON.parse(paymentDataString);
        console.log("Payment data from localStorage:", paymentDataParsed);
        
        // Normalize payment data structure (handle both formats)
        const normalizedPaymentData = {
          id: paymentDataParsed.id,
          paymentDate: paymentDataParsed.paymentDate || paymentDataParsed.payment_date,
          totalPayment: paymentDataParsed.totalPayment || paymentDataParsed.total_payment || 0,
          paymentMethod: paymentDataParsed.paymentMethod,
          accountId: paymentDataParsed.accountId || paymentDataParsed.account_id,
          paymentDetails: paymentDataParsed.paymentDetails || [],
        };
        
        setPaymentData(normalizedPaymentData);
        
        // Get user ID for conversation handling
        const userId = (normalizedPaymentData.accountId || 0).toString();
        
        // Handle lecturer conversation initialization
        const idTacGiaArrayString = localStorage.getItem("idTacGiaArray");
        if (idTacGiaArrayString) {
          const idTacGiaArray = JSON.parse(idTacGiaArrayString);
          const processedUserIds = new Set();

          const conversationPromises = idTacGiaArray
            .filter((otherUserId: any) => {
              if (!processedUserIds.has(otherUserId) && otherUserId) {
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
        paymentDate: new Date().toISOString(),
        totalPayment: 2490000,
        paymentMethod: "Zalo Pay",
        accountId: 12345,
        paymentDetails: [
          {
            id: null,
            courseId: 1,
            testId: null,
            courseBundleId: null,
            price: 1490000,
            type: "COURSE"
          },
          {
            id: null,
            courseId: null,
            testId: 2,
            courseBundleId: null,
            price: 1000000,
            type: "EXAM"
          }
        ]
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

  // Calculate total payment amount
  const totalAmount = paymentData.totalPayment || 
    (paymentData.paymentDetails && 
     paymentData.paymentDetails.reduce((total, item) => total + (item.price || 0), 0)) || 
    0;
  
  const formattedTotalPayment = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(totalAmount);

  // Fix date formatting - handle possible incorrect date format and fix year
  const getFormattedDate = () => {
    try {
      // Try to use payment date from data
      const rawDate = paymentData.paymentDate || paymentData.payment_date;
      if (rawDate) {
        const date = new Date(rawDate);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          // Create new date with current year but keep month, day, hours, minutes
          const currentYear = new Date().getFullYear();
          const correctedDate = new Date(date);
          correctedDate.setFullYear(currentYear);
          
          return correctedDate.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    } catch (error) {
      console.error("Error formatting date:", error);
    }
    
    // Fallback to current date if above fails
    return new Date().toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formattedDate = getFormattedDate();

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
                {paymentData.paymentMethod === "Zalo Pay" && (
                  <img
                    src="../../assets/images/logo/zalopay.jpg" 
                    alt="ZaloPay"
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
            <a href="/tai-khoan/khoa-hoc" className="compact-btn btn-primary">
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
              <a href="/ho-tro">Liên hệ</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentSuccess;
