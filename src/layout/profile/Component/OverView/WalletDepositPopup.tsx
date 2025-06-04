import React, { useState } from "react";
import { X } from "react-bootstrap-icons";
import styles from "./WalletDepositPopup.module.css";

interface WalletDepositPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

const WalletDepositPopup: React.FC<WalletDepositPopupProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000,2000000];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(value ? parseInt(value) : 0);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handlePayment = async (method: string) => {
    if (amount <= 0) {
      alert("Vui lòng chọn hoặc nhập số tiền muốn nạp");
      return;
    }

    setSelectedPayment(method);
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn cần đăng nhập để thực hiện thanh toán.");
        setIsLoading(false);
        return;
      }

      // Get user data from localStorage
      const userData = localStorage.getItem("authData");
      if (!userData) {
        alert("Không thể lấy thông tin người dùng");
        setIsLoading(false);
        return;
      }
      
      const parsedUserData = JSON.parse(userData);
      
      // Prepare request body for ZaloPay
      const requestBody: any = {
        appUser: parsedUserData.email,
        amount: amount,
        description: `Payment ${parsedUserData.email}`,
        bankCode: "",
        items: [{
          itemid: "wallet-deposit",
          itemname: "Nạp tiền vào ví",
          itemprice: amount,
          itemquantity: 1
        }],
        embedData: {
          redirecturl: `${window.location.origin}`,
          preferred_payment_method: []
        },
        callback_url: "http://103.166.143.198:8080/api/payment/zalo-callback"
      };

      // Save deposit info to session storage for redirect handling
      const cartCheckout = {
        id: null,
        paymentDate: new Date().toISOString(),
        subTotalPayment: amount,
        totalPayment: amount,
        totalDiscount: 0,
        discountValue: 0,
        paymentMethod: method === "ZALOPAY" ? "Zalo Pay" : "Zalo Pay QR",
        transactionId: "",
        accountId: parsedUserData.id,
        paymentType: "WALLET",
        note: "Nạp tiền vào ví",
        items: [{
          cartId: 0,
          cartItemId: 0,
          courseId: null,
          testId: null,
          courseBundleId: null,
          price: amount,
          cost: amount,
          discount: 0,
          name: "Nạp tiền vào ví",
          type: "WALLET",
          image: "",
          timestamp: new Date().toISOString()
        }],
        totalAmount: amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      sessionStorage.setItem("cartcheckout", JSON.stringify(cartCheckout));
      sessionStorage.setItem("paymentMethod", method === "ZALOPAY" ? "Zalo Pay" : "Zalo Pay QR");
      
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
      }

      // Call ZaloPay API
      const paymentResponse = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payment/create-order-web`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await paymentResponse.json();
      
      if (data && data.return_code === 1 && data.order_url) {
        // Redirect to ZaloPay payment page
        window.location.href = data.order_url;
      } else {
        // Show error message
        const errorMessage = data.return_message || data.sub_return_message || "Có lỗi xảy ra trong quá trình thanh toán";
        alert(errorMessage);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      alert("Đã xảy ra lỗi kết nối, vui lòng thử lại sau");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3>Nạp tiền vào ví</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Left Column - Amount Selection */}
          <div className={styles.amountSection}>
            <h4>Chọn số tiền</h4>
            <div className={styles.amountOptions}>
              {predefinedAmounts.map((value) => (
                <button
                  key={value}
                  className={`${styles.amountOption} ${amount === value ? styles.selected : ""}`}
                  onClick={() => handleAmountSelect(value)}
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>

            <div className={styles.customAmount}>
              <h4>Hoặc nhập số tiền khác</h4>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Nhập số tiền"
                  className={styles.input}
                />
                <span className={styles.currencyLabel}>VND</span>
              </div>
            </div>

            <div className={styles.selectedAmount}>
              <h4>Số tiền nạp:</h4>
              <div className={styles.amountDisplay}>{formatCurrency(amount)}</div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className={styles.paymentSection}>
            <h4>Phương thức thanh toán</h4>
            <div className={styles.paymentOptions}>
              <button
                className={`${styles.paymentOption} ${selectedPayment === "ZALOPAY" ? styles.selected : ""}`}
                onClick={() => handlePayment("ZALOPAY")}
                disabled={isLoading}
              >
                <div className={styles.paymentIcon}>
                  <img
                    src="../../assets/images/logo/zalopay.jpg"
                    alt="ZaloPay"
                    className={styles.paymentLogo}
                  />
                </div>
                <div className={styles.paymentText}>
                  <p>Thanh toán qua ZaloPay</p>
                </div>
              </button>

              <button
                className={`${styles.paymentOption} ${selectedPayment === "ZALOQR" ? styles.selected : ""}`}
                onClick={() => handlePayment("ZALOQR")}
                disabled={isLoading}
              >
                <div className={styles.paymentIcon}>
                  <img
                    src="../../assets/images/logo/zalopay.jpg"
                    alt="ZaloPay QR"
                    className={styles.paymentLogo}
                  />
                </div>
                <div className={styles.paymentText}>
                  <p>ZaloPay - Quét mã QR</p>
                </div>
              </button>
            </div>

            {isLoading && (
              <div className={styles.loadingIndicator}>
                <div className={styles.spinner}></div>
                <p>Đang xử lý thanh toán...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDepositPopup; 