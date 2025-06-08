import React, { useState } from "react";
import { X, CheckCircle, ExclamationTriangle } from "react-bootstrap-icons";
import styles from "./WalletDepositPopup.module.css";

interface WalletDepositPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
  walletId: number;
}

const WalletDepositPopup: React.FC<WalletDepositPopupProps> = ({
  isOpen,
  onClose,
  onDepositSuccess,
  walletId,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const predefinedAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
    setPaymentError(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(value ? parseInt(value) : 0);
      setPaymentError(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSelectPayment = (method: string) => {
    if (amount <= 0) {
      setPaymentError("Vui lòng chọn hoặc nhập số tiền muốn nạp");
      return;
    }

    setSelectedPayment(method);
    setStep("confirm");
  };

  const handleConfirmPayment = async () => {
    if (amount <= 0 || !selectedPayment) {
      setPaymentError("Vui lòng chọn hoặc nhập số tiền muốn nạp");
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setPaymentError("Bạn cần đăng nhập để thực hiện thanh toán.");
        setIsLoading(false);
        return;
      }

      // Get user data from localStorage
      const userData = localStorage.getItem("authData");
      if (!userData) {
        setPaymentError("Không thể lấy thông tin người dùng");
        setIsLoading(false);
        return;
      }

      const parsedUserData = JSON.parse(userData);

      // Prepare request body for ZaloPay
      const requestBody = {
        appUser: parsedUserData.email,
        amount: amount,
        description: `Payment ${parsedUserData.email}`,
        bankCode: "",
        items: [
          {
            itemid: 1,
            itemname: "Nạp tiền vào Ví",
            itemprice: amount,
            itemtype: "WALLET"
          }
        ],
        embedData: {
          preferred_payment_method: selectedPayment === "ZALOPAY" ?
            ["domestic_card", "account"] :
            ["zalopay_wallet"],
          redirecturl: `${window.location.origin}/tai-khoan/overview`
        },
        callback_url: `${process.env.REACT_APP_SERVER_HOST}/api/payment/zalo-callback`
      };

      // Save deposit info to session storage for redirect handling
      const cartCheckout = {
        id: null,
        paymentDate: new Date().toISOString(),
        subTotalPayment: amount,
        totalPayment: amount,
        totalDiscount: 0,
        discountValue: 0,
        paymentMethod: selectedPayment === "ZALOPAY" ? "ZaloPay" : "ZaloPay",
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
          timestamp: new Date().toISOString(),
          walletId: walletId
        }],
        totalAmount: amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      sessionStorage.setItem("cartcheckout", JSON.stringify(cartCheckout));
      sessionStorage.setItem("paymentMethod", selectedPayment === "ZALOPAY" ? "ZaloPay" : "ZaloPay");

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
        setPaymentError(errorMessage);
        setIsLoading(false);
        setStep("select");
      }
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      setPaymentError("Đã xảy ra lỗi kết nối, vui lòng thử lại sau");
      setIsLoading(false);
      setStep("select");
    }
  };

  const handleBack = () => {
    setStep("select");
    setPaymentError(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3>{step === "select" ? "Nạp tiền vào ví" : "Xác nhận thanh toán"}</h3>
          <button className={styles.closeButton} onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {paymentError && (
          <div className={styles.errorMessage}>
            <ExclamationTriangle size={16} />
            <span>{paymentError}</span>
          </div>
        )}

        {step === "select" ? (
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
                  onClick={() => handleSelectPayment("ZALOPAY")}
                  disabled={isLoading}
                >
                  <div className={styles.paymentIcon}>
                    <img
                      src="/assets/images/logo/zalopay.jpg"
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
                  onClick={() => handleSelectPayment("ZALOQR")}
                  disabled={isLoading}
                >
                  <div className={styles.paymentIcon}>
                    <img
                      src="/assets/images/logo/zalopay.jpg"
                      alt="ZaloPay QR"
                      className={styles.paymentLogo}
                    />
                  </div>
                  <div className={styles.paymentText}>
                    <p>ZaloPay - Quét mã QR</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.content} ${styles.confirmContent}`}>
            <div className={styles.confirmDetails}>
              <h4 className={styles.confirmTitle}>Chi tiết giao dịch</h4>

              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Loại giao dịch:</span>
                <span className={styles.confirmValue}>Nạp tiền vào ví</span>
              </div>

              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Số tiền:</span>
                <span className={styles.confirmValue}>{formatCurrency(amount)}</span>
              </div>

              <div className={styles.confirmItem}>
                <span className={styles.confirmLabel}>Phương thức:</span>
                <span className={styles.confirmValue}>
                  {selectedPayment === "ZALOPAY" ? "Thanh toán qua ZaloPay" : "ZaloPay - Quét mã QR"}
                </span>
              </div>

              <div className={styles.confirmNote}>
                <p>Bạn sẽ được chuyển đến trang thanh toán ZaloPay để hoàn tất giao dịch.</p>
              </div>
            </div>

            <div className={styles.confirmActions}>
              <button className={styles.backButton} onClick={handleBack} disabled={isLoading}>
                Quay lại
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Xác nhận thanh toán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDepositPopup; 