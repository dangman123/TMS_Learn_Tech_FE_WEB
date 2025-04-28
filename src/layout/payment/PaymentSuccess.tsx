import React, { useEffect, useState } from "react";
import "./style.css";
import { push, ref, set } from "firebase/database";
import { database } from "../util/fucntion/firebaseConfig";
interface PaymentData {
  id: number;
  payment_date: string;
  total_payment: number;
  paymentMethod: string;
  account_id: number;
}
function PaymentSuccess() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const createConversation = async (
    userId: string,
    otherUserId: string,
    message: string
  ) => {
    // Tạo đối tượng hội thoại
    const newConversation = {
      lastMessage: message,
      participants: [otherUserId.toString(), userId.toString()],
      timestamp: new Date().toISOString(),
    };

    try {
      // Tạo ID ngẫu nhiên cho cuộc hội thoại mới
      const conversationsRef = ref(database, "conversations");
      const newConversationRef = push(conversationsRef); // Tạo ID ngẫu nhiên cho cuộc hội thoại
      await set(newConversationRef, newConversation); // Lưu cuộc hội thoại mới vào Firebase

      // Tạo tin nhắn đầu tiên cho cuộc hội thoại
      const newMessage = {
        senderId: userId.toString(),
        content: message,
        timestamp: new Date().toISOString(),
      };

      // Lưu tin nhắn vào mục messages trong Firebase
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
    createConversation(userId, otherUserId, initialMessage);
  };

  // useEffect(() => {
  //   const paymentDataString = localStorage.getItem("totalPayment");

  //   if (paymentDataString) {
  //     const paymentDataParsed = JSON.parse(paymentDataString);
  //     setPaymentData(paymentDataParsed);
  //     const userId = paymentDataParsed.account_id.toString();
  //     const idTacGiaArrayString = localStorage.getItem("idTacGiaArray");

  //     if (idTacGiaArrayString) {
  //       const idTacGiaArray = JSON.parse(idTacGiaArrayString);

  //       const conversationPromises = idTacGiaArray.map((otherUserId: any) =>

  //         startConversation(
  //           userId,
  //           otherUserId
  //         )
  //       );
  //       localStorage.removeItem("idTacGiaArray");
  //     } else {
  //       console.error("Không tìm thấy mảng idTacGia trong localStorage.");
  //     }
  //   }
  // }, []);


  useEffect(() => {
    const paymentDataString = localStorage.getItem("totalPayment");

    if (paymentDataString) {
      const paymentDataParsed = JSON.parse(paymentDataString);
      setPaymentData(paymentDataParsed);
      const userId = paymentDataParsed.account_id.toString();
      const idTacGiaArrayString = localStorage.getItem("idTacGiaArray");

      if (idTacGiaArrayString) {
        const idTacGiaArray = JSON.parse(idTacGiaArrayString);
        const processedUserIds = new Set(); // Tập hợp để kiểm tra trùng lặp

        const conversationPromises = idTacGiaArray
          .filter((otherUserId: any) => {
            if (!processedUserIds.has(otherUserId)) {
              processedUserIds.add(otherUserId);
              return true;
            }
            return false;
          })
          .map((otherUserId: any) =>
            startConversation(userId, otherUserId)
          );

        Promise.all(conversationPromises)
          .then(() => {
            console.log("Tất cả cuộc trò chuyện đã được bắt đầu.");
          })
          .catch((error) => {
            console.error("Lỗi khi bắt đầu cuộc trò chuyện:", error);
          });

        localStorage.removeItem("idTacGiaArray");
      } else {
        console.error("Không tìm thấy mảng idTacGia trong localStorage.");
      }
    }
  }, []);


  if (!paymentData) {
    return <div>Loading...</div>;
  }

  const formattedTotalPayment = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(paymentData.total_payment);

  return (
    <section className="payment-success-area pt-120 pb-120 text-center">
      <div className="container">
        <div className="payment-success-content">
          {/* Icon thành công */}
          <div className="success-icon">
            <i
              className="fa fa-check-circle text-success"
              style={{ fontSize: "72px" }}
            ></i>
          </div>

          {/* Tiêu đề */}
          <h2 className="mt-4">Thanh toán thành công!</h2>
          <p className="text-muted">
            Cảm ơn bạn đã hoàn tất giao dịch. Hãy kiểm tra email của bạn! Chi
            tiết giao dịch của bạn như sau:
          </p>

          {/* Chi tiết giao dịch */}
          <div className="transaction-details text-left mt-4">
            <p>
              <strong>Mã đơn hàng:</strong>{" "}
              <span id="orderId">{paymentData.id}</span>
            </p>
            <p>
              <strong>Số tiền thanh toán:</strong>{" "}
              <span id="totalAmount">{formattedTotalPayment}</span>
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {paymentData.paymentMethod}
            </p>
            <p>
              <strong>Ngày giao dịch:</strong>{" "}
              {paymentData.payment_date
                ? new Date(paymentData.payment_date).toLocaleDateString("vi-VN")
                : "Không có ngày"}
            </p>
          </div>

          {/* Lựa chọn hành động tiếp theo */}
          <div className="actions mt-5">
            <button className="btn btn-primary btn-lg mx-2">
              <a href={`/tai-khoan`}>Về tài khoản</a>
            </button>
            <button className="btn btn-secondary btn-lg mx-2">
              <a href={`/`}>Quay về trang chính</a>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PaymentSuccess;
