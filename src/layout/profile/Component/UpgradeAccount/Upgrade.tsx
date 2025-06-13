import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, X, Star, Tag, CreditCard, QrCode, Wallet, ChevronDown } from "react-bootstrap-icons";
import "./Upgrade.css";
import { authTokenLogin, refreshToken } from "../../../util/fucntion/auth";
import { useNavigate, useLocation } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { sendActionActivity } from "../../../../service/WebSocketActions";

interface Feature {
  text: string;
  highlight?: boolean;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  status: string;
  subscribersCount: number;
  createdAt: string;
  updatedAt: string;
  isSubscribed?: boolean;
}

interface ApiResponse {
  status: number;
  message: string;
  data: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: SubscriptionPlan[];
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const Upgrade: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("year");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [expandedFaq, setExpandedFaq] = useState<string>("switch");
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [currentPlanToSwitch, setCurrentPlanToSwitch] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("atm");
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletInfo, setWalletInfo] = useState<{ walletId?: number; code?: string; balance?: number; accountId?: number; fullname?: string }>({});
  const [planToSubscribe, setPlanToSubscribe] = useState<SubscriptionPlan | null>(null);
  const [expandedFeatures, setExpandedFeatures] = useState<{ [key: string]: boolean }>({});
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState<boolean>(false);
  const [showPaymentFailureModal, setShowPaymentFailureModal] = useState<boolean>(false);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string>("");
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionPlan | null>(null);
  const [showWalletConfirmation, setShowWalletConfirmation] = useState<boolean>(false);
  const [confirmedWalletPayment, setConfirmedWalletPayment] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const userData = JSON.parse(localStorage.getItem("authData") || "{}");

  // Number of features to show initially
  const initialFeaturesCount = 3;

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "atm",
      name: "Thẻ ATM",
      icon: <CreditCard size={24} />,
      description: "Thanh toán bằng thẻ ATM nội địa"
    },
    {
      id: "qr",
      name: "QR ZaloPay",
      icon: <QrCode size={24} />,
      description: "Quét mã QR bằng ứng dụng ZaloPay"
    },
    {
      id: "wallet",
      name: "Ví cá nhân",
      icon: <Wallet size={24} />,
      description: "Thanh toán bằng số dư trong ví"
    }
  ];

  // Define types for processed transactions
  type ProcessedTransactions = string[];

  // Check for payment status in URL when component mounts
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get URL search params
      const searchParams = new URLSearchParams(location.search);
      const status = searchParams.get('status');

      // Only process if status parameter exists
      if (status !== null) {
        // Status 1 means success, anything else is an error
        if (status === '1') {
          // Get other necessary params
          const amount = searchParams.get('amount');
          const appTransId = searchParams.get('apptransid');

          // Check if this transaction has already been processed
          const processedTransactions = sessionStorage.getItem('processedTransactions');
          const processedList: string[] = processedTransactions ? JSON.parse(processedTransactions) : [];

          if (amount && appTransId && !processedList.includes(appTransId)) {
            try {
              setProcessingPayment(true);

              // Mark this transaction as being processed to prevent duplicate calls
              processedList.push(appTransId);
              sessionStorage.setItem('processedTransactions', JSON.stringify(processedList));

              await confirmPayment(parseInt(amount), appTransId);

              // Show success message
              setShowPaymentSuccessModal(true);

              // Clear URL params after processing
              navigate('/tai-khoan/upgrade', { replace: true });
            } catch (err) {
              console.error("Payment confirmation error:", err);
              const errorMessage = "Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.";
              setError(errorMessage);
              setPaymentFailureMessage(errorMessage);
              setShowPaymentFailureModal(true);

              // If there's an error, remove from processed list to allow retry
              if (appTransId) {
                const updatedList = processedList.filter((id: string) => id !== appTransId);
                sessionStorage.setItem('processedTransactions', JSON.stringify(updatedList));
              }
            } finally {
              setProcessingPayment(false);
            }
          } else if (appTransId && processedList.includes(appTransId)) {
            // Transaction was already processed, just clear URL params
            navigate('/tai-khoan/upgrade', { replace: true });
          }
        } else {
          // Payment failed
          const errorMessage = `Thanh toán không thành công. Mã lỗi: ${status}`;
          setError(errorMessage);
          setPaymentFailureMessage(errorMessage);
          setShowPaymentFailureModal(true);

          // Clear URL params after processing
          navigate('/tai-khoan/upgrade', { replace: true });
        }
      }
    };

    checkPaymentStatus();
  }, [location]);

  // Cleanup function to remove old processed transactions
  useEffect(() => {
    const cleanupProcessedTransactions = () => {
      // Keep the processed transactions list from growing too large
      const processedTransactions = sessionStorage.getItem('processedTransactions');
      if (processedTransactions) {
        const processedList: ProcessedTransactions = JSON.parse(processedTransactions);
        // Keep only the last 10 transactions
        if (processedList.length > 10) {
          const trimmedList = processedList.slice(-10);
          sessionStorage.setItem('processedTransactions', JSON.stringify(trimmedList));
        }
      }
    };

    cleanupProcessedTransactions();
  }, []);

  // Confirm payment with backend
  const confirmPayment = async (amount: number, transactionId: string) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    // Get current date in ISO format
    const now = new Date();
    const isoDate = now.toISOString();

    // Get plan from session storage instead of finding by price
    const planDataString = sessionStorage.getItem('subscribingPlan');
    if (!planDataString) {
      throw new Error("Không tìm thấy thông tin gói đăng ký");
    }

    const planData = JSON.parse(planDataString);

    let methodPayment = "ZaloPay";
    if (selectedPaymentMethod === "qr") {
      methodPayment = "ZaloPay";
    } else if (selectedPaymentMethod === "wallet") {
      methodPayment = "WALLET";
    }

    // Create payment details
    const paymentDetail = {
      paymentId: null,
      subscriptionId: planData.id,
      walletId: methodPayment === "WALLET" ? walletInfo.walletId : null,
      type: "SUBSCRIPTION",
      price: amount
    };

    const payload = {
      paymentDate: isoDate,
      subTotalPayment: amount,
      totalPayment: amount,
      totalDiscount: 0,
      discountValue: 0,
      paymentMethod: methodPayment,
      transactionId: transactionId,
      accountId: userData.id,
      paymentType: "SUBSCRIPTION",
      note: `Thanh toán thành công cho đơn hàng #${transactionId}`,
      paymentDetails: [paymentDetail],
      createdAt: isoDate,
      updatedAt: isoDate
    };

    const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/payments/v2/payment-gateway`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xác nhận thanh toán thất bại");
    }
    // Payment confirmed successfully - clear session storage
    sessionStorage.removeItem('subscribingPlan');
    return await response.json();
  };

  // Move fetchSubscriptionPlans outside useEffect to make it reusable
  const fetchSubscriptionPlans = async (duration: string, isInitialLoad = false) => {
    try {
      let durationNumber = 1;
      if (duration === "month") {
        durationNumber = 1;
      } else if (duration === "6month") {
        durationNumber = 6;
      } else if (duration === "year") {
        durationNumber = 12;
      }

      // Use different loading states for initial vs subsequent loads
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setPlansLoading(true);
      }
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions/page?duration=${durationNumber}&accountId=${userData.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setSubscriptionPlans(data.data.content);

      // Set the first plan as selected by default if available
      if (data.data.content.length > 0) {
        setSelectedPlan(data.data.content[0].id.toString());
      }

      if (isInitialLoad) {
        setLoading(false);
      } else {
        setPlansLoading(false);
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError('Failed to load subscription plans. Please try again later.');
      setLoading(false);
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans(selectedPeriod, true);
  }, []);

  const handleSwitchPlan = (planId: string): void => {
    const plan = subscriptionPlans.find(p => p.id.toString() === planId);
    if (!plan) return;

    setCurrentPlanToSwitch(plan);
    setShowConfirmModal(true);
  };

  const confirmSwitchPlan = (): void => {
    if (!currentPlanToSwitch) return;

    setShowConfirmModal(false);

    console.log(`Đang chuyển sang gói ${currentPlanToSwitch.name}`);

    setTimeout(() => {
      setSelectedPlan(currentPlanToSwitch.id.toString());
      setShowSuccessModal(true);
    }, 1000);
  };

  const closeModals = (): void => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
  };

  // Update handlePeriodChange to fetch subscription plans when period changes
  const handlePeriodChange = (period: string): void => {
    setSelectedPeriod(period);
    fetchSubscriptionPlans(period, false);
  };

  // Xử lý chọn gói thành viên
  const handlePlanSelect = (planId: string): void => {
    setSelectedPlan(planId);
  };

  // Xử lý mở/đóng câu hỏi thường gặp
  const toggleFaq = (faqId: string): void => {
    if (expandedFaq === faqId) {
      setExpandedFaq(""); // Thay vì null, sử dụng chuỗi rỗng
    } else {
      setExpandedFaq(faqId);
    }
  };

  // Xử lý hiển thị/ẩn bảng so sánh
  const toggleComparison = (): void => {
    setShowComparison(!showComparison);
  };

  // Format price to VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  // Fetch wallet balance and information
  const fetchWalletBalance = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/wallet/info-simple/${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Wallet API response:", result);

      if (result.status === 200 && result.data) {
        // API response format: { walletId, code, balance, accountId, fullname }
        const walletData = result.data;
        setWalletBalance(walletData.balance);
        setWalletInfo(walletData);
      } else {
        console.error('Error fetching wallet balance:', result.message);
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  // Handle subscription purchase
  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (userData.id) {
      const data = { "testId": null,subscriptionId: plan.id, "courseId": null, "lessonId": null, "videoId": null, "action": "Thanh toán gói thành viên" + plan.name }
      sendActionActivity(userData.id.toString(), "/app/purchase_subscription", data, "Thanh toán gói thành viên" + plan.name)
    }
    // sendActionActivity(userData.id.toString(), "/app/purchase_subscription", data, "Thanh toán gói thành viên" + plan.name)

    // Store plan details in sessionStorage for payment confirmation later
    sessionStorage.setItem('subscribingPlan', JSON.stringify(plan));
    setPlanToSubscribe(plan);
    setShowPaymentModal(true);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentError(null);
  };

  // Process payment
  const processPayment = async () => {
    if (!planToSubscribe) return;

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Prepare common payload
      const basePayload = {
        appUser: userData.email || "user@example.com",
        amount: planToSubscribe.price,
        description: `Payment ${userData.email || "user@example.com"}`,
        bankCode: "",
        items: [
          {
            itemid: planToSubscribe.id,
            itemname: planToSubscribe.name,
            itemprice: planToSubscribe.price,
            itemtype: "SUBSCRIPTION"
          }
        ],
        embedData: {
          redirecturl: `${window.location.origin}/tai-khoan/upgrade`
        }
      };

      let endpoint;
      let payload;

      // Configure endpoint and payload based on payment method
      if (selectedPaymentMethod === "wallet") {
        if (!walletInfo.walletId) {
          throw new Error("Không tìm thấy thông tin ví. Vui lòng thử lại sau.");
        }

        // Step 1: Initialize wallet payment to get transaction ID
        endpoint = `${process.env.REACT_APP_SERVER_HOST}/api/payments/v2/init-wallet?walletId=${walletInfo.walletId}`;
        payload = basePayload;

        console.log("Sending wallet init request:", endpoint, payload);

        // Show processing animation for wallet payment
        setProcessingPayment(true);

        const initResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const initData = await initResponse.json();
        console.log("Wallet init API response:", initData);

        if (!initResponse.ok) {
          throw new Error(initData.message || "Wallet payment initialization failed");
        }

        // Get transaction ID from the init response
        const transactionId = initData.data?.transactionId;
        if (!transactionId) {
          throw new Error("Không nhận được mã giao dịch từ hệ thống");
        }

        // Step 2: Complete the payment with transaction ID
        const now = new Date();
        const isoDate = now.toISOString();

        // Prepare the payment payload
        const completePaymentPayload = {
          id: null,
          paymentDate: isoDate,
          subTotalPayment: planToSubscribe.price,
          totalPayment: planToSubscribe.price,
          totalDiscount: 0,
          discountValue: 0,
          paymentMethod: "WALLET",
          transactionId: transactionId,
          accountId: userData.id,
          paymentType: "SUBSCRIPTION",
          note: `Thanh toán thành công cho đơn hàng #${transactionId}`,
          paymentDetails: [
            {
              id: null,
              courseId: null,
              testId: null,
              courseBundleId: null,
              subscriptionId: planToSubscribe.id,
              walletId: walletInfo.walletId,
              price: planToSubscribe.price,
              type: "SUBSCRIPTION"
            }
          ],
          createdAt: isoDate,
          updatedAt: isoDate
        };

        console.log("Sending complete payment request:", completePaymentPayload);

        // Call the payment completion API
        const completeResponse = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/payments/v2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(completePaymentPayload)
        });

        const completeData = await completeResponse.json();
        console.log("Complete payment API response:", completeData);

        if (!completeResponse.ok) {
          throw new Error(completeData.message || "Không thể hoàn tất thanh toán");
        }

        // Handle successful wallet payment
        setShowPaymentModal(false);
        setSelectedPlan(planToSubscribe.id.toString());
        setShowPaymentSuccessModal(true);
        fetchWalletBalance(); // Refresh wallet balance
      } else {
        endpoint = `${process.env.REACT_APP_SERVER_HOST}/api/payment/create-order-web`;
        payload = {
          ...basePayload,
          embedData: {
            ...basePayload.embedData,
            preferred_payment_method: selectedPaymentMethod === "qr" ? ["zalopay_wallet"] : ["domestic_card", "account"]
          },
          callback_url: `${process.env.REACT_APP_SERVER_HOST}/api/payment/zalo-callback`
        };

        console.log("Sending payment request:", endpoint, payload);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Payment API response:", data);

        if (!response.ok) {
          throw new Error(data.message || data.return_message || "Payment processing failed");
        }

        // Handle ZaloPay or ATM response

        // For ATM/QR, redirect to payment gateway
        if (data.data && data.data.order_url) {
          // If order_url is nested in data object
          window.location.href = data.data.order_url;
        } else if (data.order_url) {
          // If order_url is directly in the response
          window.location.href = data.order_url;
        } else {
          throw new Error("No payment URL received");
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMessage = err.message || "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.";
      setPaymentError(errorMessage);
      setPaymentFailureMessage(errorMessage);
      setShowPaymentFailureModal(true);

      // Remove plan from session storage if payment fails
      sessionStorage.removeItem('subscribingPlan');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanToSubscribe(null);
    setPaymentError(null);
  };

  // Handle overlay click to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not its children
    if (e.target === e.currentTarget) {
      closeAllModals();
    }
  };

  // Toggle expanded features for a plan
  const toggleFeatures = (planId: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Close all modals including payment status modals
  const closeAllModals = (): void => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setShowPaymentModal(false);
    setShowPaymentSuccessModal(false);
    setShowPaymentFailureModal(false);
    setShowSubscriptionDetails(false);
    setShowWalletConfirmation(false);
  };

  // Add function to handle viewing subscription details
  const viewSubscriptionDetails = (plan: SubscriptionPlan) => {
    setSelectedSubscription(plan);
    setShowSubscriptionDetails(true);
  };

  // Function to show confirmation modal before wallet payment
  const handleWalletPaymentConfirm = () => {
    if (selectedPaymentMethod === "wallet") {
      setShowWalletConfirmation(true);
    } else {
      // For other payment methods, process directly
      processPayment();
    }
  };

  // Function to confirm wallet payment
  const confirmWalletPayment = () => {
    setConfirmedWalletPayment(true);
    setShowWalletConfirmation(false);
    processPayment();
  };

  // Render loading state for initial page load or payment processing
  if (loading || processingPayment) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{processingPayment ? "Đang xử lý thanh toán..." : "Đang tải dữ liệu..."}</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="upgrade-container">
      {/* Header */}
      <div className="upgrade-header">
        <div className="header-title">Gói thành viên</div>
      </div>
      {/* Banner nâng cấp */}
      <div className="upgrade-banner">
        <div className="banner-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <div className="banner-content">
          <h2 className="banner-title">Nâng cấp tài khoản ngay</h2>
          <p className="banner-subtitle">Mở khóa toàn bộ tính năng cao cấp</p>
        </div>
      </div>
      {/* Lợi ích khi nâng cấp */}
      <div className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Truy cập không giới hạn</div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Hỗ trợ ưu tiên</div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
                fill="#4154f1"
              />
            </svg>
          </div>
          <div className="benefit-text">Tải tài liệu</div>
        </div>
      </div>
      {/* Chọn thời hạn */}
      <div className="section-title">Chọn thời hạn</div>
      <div className="period-selection">
        <button
          className={`period-button ${selectedPeriod === "month" ? "active" : ""
            }`}
          onClick={() => handlePeriodChange("month")}
        >
          Hàng tháng
        </button>
        <button
          className={`period-button ${selectedPeriod === "6month" ? "active" : ""
            }`}
          onClick={() => handlePeriodChange("6month")}
        >
          <span className="button-text">6 tháng</span>
          <div className="popular-badge">
            <Star size={12} /> Phổ biến
          </div>
        </button>
        <button
          className={`period-button ${selectedPeriod === "year" ? "active" : ""
            }`}
          onClick={() => handlePeriodChange("year")}
        >
          <span className="button-text">Hàng năm</span>
          <div className="discount-badge">
            <Tag size={12} /> Tiết kiệm 20%
          </div>
        </button>
      </div>
      {/* Chọn gói thành viên */}
      <div className="section-title">Chọn gói thành viên</div>

      {plansLoading ? (
        <div className="plans-loading-container">
          <div className="plans-loading-spinner"></div>
          <p>Đang tải gói thành viên...</p>
        </div>
      ) : (
        <div className="plans-container">
          {subscriptionPlans.map((plan) => {
            const isExpanded = expandedFeatures[plan.id.toString()] || false;
            const displayedFeatures = isExpanded ? plan.features : plan.features.slice(0, initialFeaturesCount);

            return (
              <div
                key={plan.id}
                className={`plan-card ${plan.name.toLowerCase().includes('premium') ? 'premium' : ''
                  } ${selectedPlan === plan.id.toString() ? "selected" : ""}`}
              >
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">{formatPrice(plan.price)}</div>
                </div>

                <ul className="plan-features">
                  {displayedFeatures.map((feature, index) => (
                    <li key={index} className={index > 3 ? "feature-highlight" : ""}>
                      <Check
                        className={`check-icon ${index > 3 ? "highlight" : ""}`}
                        size={20}
                      />
                      <span className="feature-text">{feature}</span>
                      {index > 3 && <span className="highlight-tag">Nổi bật</span>}
                    </li>
                  ))}

                  {plan.features.length > initialFeaturesCount && (
                    <li className="feature-toggle" onClick={() => toggleFeatures(plan.id.toString())}>
                      <div className="feature-toggle-button">
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                        <ChevronDown className={`toggle-icon ${isExpanded ? 'expanded' : ''}`} size={16} />
                      </div>
                    </li>
                  )}
                </ul>

                <div className="plan-button-group">
                  {plan.isSubscribed ? (
                    <button
                      className={`plan-button subscribed-button ${plan.name.toLowerCase().includes('premium') ? 'premium-button' : ''}`}
                      onClick={() => viewSubscriptionDetails(plan)}
                    >
                      Gói của bạn
                    </button>
                  ) : (
                    <button
                      className={`plan-button ${plan.name.toLowerCase().includes('premium') ? 'premium-button' : ''}`}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {plan.name.toLowerCase().includes('premium') ? 'Đăng ký ngay' : 'Đăng ký gói này'}
                    </button>
                  )}
                  <button
                    className={`plan-switch-button ${plan.name.toLowerCase().includes('premium') ? 'premium-switch-button' :
                      plan.name.toLowerCase().includes('business') ? 'business-switch-button' : ''
                      }`}
                    onClick={() => handleSwitchPlan(plan.id.toString())}
                  >
                    Đổi gói {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* So sánh các gói */}
      <div className="comparison-section" onClick={toggleComparison}>
        <h3 className="comparison-title">So sánh các gói thành viên</h3>
        {showComparison && subscriptionPlans.length >= 2 && (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Tính năng</th>
                  {subscriptionPlans.slice(0, 2).map(plan => (
                    <th key={plan.id}>{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Truy cập khóa học</td>
                  <td className="limited">Giới hạn</td>
                  <td className="full">Không giới hạn</td>
                </tr>
                <tr>
                  <td>Tải tài liệu</td>
                  <td className="limited">Giới hạn</td>
                  <td className="full">Không giới hạn</td>
                </tr>
                <tr>
                  <td>Chứng chỉ</td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Hỗ trợ</td>
                  <td>Email</td>
                  <td>Email & Chat</td>
                </tr>
                <tr>
                  <td>Thảo luận với giảng viên</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Học theo nhóm</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Quản lý nhóm</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                </tr>
                <tr>
                  <td>Báo cáo tiến độ</td>
                  <td className="no-check">
                    <X className="x-icon" size={16} />
                  </td>
                  <td className="check">
                    <Check className="check-icon-table" size={16} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Câu hỏi thường gặp */}
      <div className="faq-section">
        <h3 className="faq-title">Câu hỏi thường gặp</h3>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("switch")}>
            <div className="question-text">
              Tôi có thể đổi gói thành viên không?
            </div>
            <div
              className={`faq-arrow ${expandedFaq === "switch" ? "expanded" : ""
                }`}
            >
              {expandedFaq === "switch" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "switch" && (
            <div className="faq-answer">
              Bạn có thể nâng cấp gói thành viên bất kỳ lúc nào. Khi nâng cấp,
              chúng tôi sẽ tính phí chênh lệch tương ứng với thời gian còn lại
              của gói hiện tại.
            </div>
          )}
        </div>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("auto-renew")}>
            <div className="question-text">Có tự động gia hạn không?</div>
            <div
              className={`faq-arrow ${expandedFaq === "auto-renew" ? "expanded" : ""
                }`}
            >
              {expandedFaq === "auto-renew" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "auto-renew" && (
            <div className="faq-answer">
              Có, gói thành viên sẽ được tự động gia hạn khi hết hạn sử dụng.
              Bạn có thể tắt tính năng tự động gia hạn trong phần cài đặt tài
              khoản.
            </div>
          )}
        </div>

        <div className="faq-item">
          <div className="faq-question" onClick={() => toggleFaq("cancel")}>
            <div className="question-text">
              Tôi có thể hủy gói thành viên không?
            </div>
            <div
              className={`faq-arrow ${expandedFaq === "cancel" ? "expanded" : ""
                }`}
            >
              {expandedFaq === "cancel" ? "▲" : "▼"}
            </div>
          </div>
          {expandedFaq === "cancel" && (
            <div className="faq-answer">
              Bạn có thể hủy gói thành viên bất kỳ lúc nào trong phần cài đặt
              tài khoản. Khi hủy, bạn vẫn có thể sử dụng gói đã thanh toán cho
              đến hết thời hạn.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && currentPlanToSwitch && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container">
            <div className="modal-header">
              <h3>Xác nhận chuyển gói</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn chuyển sang gói {currentPlanToSwitch.name}?</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeAllModals}>Hủy</button>
              <button className="confirm-button" onClick={confirmSwitchPlan}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && currentPlanToSwitch && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container">
            <div className="modal-header">
              <h3>Chuyển gói thành công</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn đã chuyển sang gói {currentPlanToSwitch.name} thành công!</p>
            </div>
            <div className="modal-footer">
              <button className="confirm-button" onClick={closeAllModals}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && planToSubscribe && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container payment-modal">
            <div className="modal-header payment-modal-header">
              <h3>Thanh toán đăng ký gói</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-summary">
                <h4>Thông tin đăng ký</h4>
                <div className="payment-plan-info">
                  <div className="payment-plan-name">{planToSubscribe.name}</div>
                  <div className="payment-plan-price">{formatPrice(planToSubscribe.price)}</div>
                </div>
                <div className="payment-plan-duration">
                  Thời hạn: {planToSubscribe.duration} tháng
                </div>
              </div>

              <div className="payment-methods">
                <h4>Chọn phương thức thanh toán</h4>
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-method-item ${selectedPaymentMethod === method.id ? 'selected' : ''} ${method.id === 'wallet' && walletBalance < (planToSubscribe?.price || 0) ? 'disabled' : ''
                      }`}
                    onClick={() => {
                      // Don't allow selecting wallet if balance is insufficient
                      if (method.id === 'wallet' && walletBalance < (planToSubscribe?.price || 0)) {
                        return;
                      }
                      handlePaymentMethodSelect(method.id);
                    }}
                  >
                    <div className="payment-method-icon">
                      {method.icon}
                    </div>
                    <div className="payment-method-info">
                      <div className="payment-method-name">{method.name}</div>
                      <div className="payment-method-description">{method.description}</div>
                      {method.id === 'wallet' && (
                        <div className="payment-wallet-balance">
                          <div>Số dư: {formatPrice(walletBalance)}</div>
                          {walletInfo.fullname && (
                            <div className="payment-wallet-owner">Chủ ví: {walletInfo.fullname}</div>
                          )}
                          {walletInfo.code && (
                            <div className="payment-wallet-code">Mã ví: {walletInfo.code.substring(0, 8)}...</div>
                          )}
                          {walletBalance < planToSubscribe.price && (
                            <div className="payment-wallet-warning">Số dư không đủ</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="payment-method-check">
                      {selectedPaymentMethod === method.id && <Check size={18} />}
                    </div>
                  </div>
                ))}
              </div>

              {paymentError && (
                <div className="payment-error">
                  {paymentError}
                </div>
              )}
            </div>
            <div className="modal-footer payment-modal-footer">
              <button className="cancel-button" onClick={closeAllModals}>Hủy</button>
              <button
                className="confirm-button"
                onClick={selectedPaymentMethod === "wallet" ? handleWalletPaymentConfirm : processPayment}
                disabled={processingPayment || (selectedPaymentMethod === 'wallet' && walletBalance < planToSubscribe.price)}
              >
                {processingPayment ? (
                  <>
                    <span className="processing-spinner"></span>
                    <span>Đang xử lý...</span>
                  </>
                ) : 'Thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Payment Confirmation Modal */}
      {showWalletConfirmation && planToSubscribe && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container wallet-confirm-modal">
            <div className="modal-header wallet-confirm-modal-header">
              <h3>Xác nhận thanh toán</h3>
              <button className="close-button" onClick={() => setShowWalletConfirmation(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="wallet-confirm-icon">
                <Wallet size={48} color="#4154f1" />
              </div>

              <div className="wallet-confirm-title">
                Xác nhận thanh toán từ ví cá nhân
              </div>

              <div className="wallet-confirm-details">
                <div className="wallet-confirm-item">
                  <span className="wallet-confirm-label">Gói đăng ký:</span>
                  <span className="wallet-confirm-value">{planToSubscribe.name}</span>
                </div>

                <div className="wallet-confirm-item">
                  <span className="wallet-confirm-label">Số tiền:</span>
                  <span className="wallet-confirm-value highlight">{formatPrice(planToSubscribe.price)}</span>
                </div>

                <div className="wallet-confirm-item">
                  <span className="wallet-confirm-label">Thời hạn:</span>
                  <span className="wallet-confirm-value">{planToSubscribe.duration} tháng</span>
                </div>

                <div className="wallet-confirm-item">
                  <span className="wallet-confirm-label">Số dư ví:</span>
                  <span className="wallet-confirm-value">{formatPrice(walletBalance)}</span>
                </div>

                <div className="wallet-confirm-item">
                  <span className="wallet-confirm-label">Số dư còn lại:</span>
                  <span className="wallet-confirm-value">{formatPrice(walletBalance - planToSubscribe.price)}</span>
                </div>
              </div>

              <div className="wallet-confirm-notice">
                Số tiền sẽ được trừ trực tiếp từ ví của bạn. Bạn có chắc chắn muốn tiếp tục?
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowWalletConfirmation(false)}>Hủy bỏ</button>
              <button className="confirm-button" onClick={confirmWalletPayment}>
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal - Improved design */}
      {showPaymentSuccessModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container payment-success-modal">
            <div className="modal-header">
              <h3>Thanh toán thành công</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* <div className="success-animation">
                <div className="checkmark-circle">
                  <div className="checkmark draw"></div>
                </div>
              </div> */}
              <div className="success-title">Giao dịch hoàn tất!</div>
              <div className="success-message">
                <p>Gói thành viên của bạn đã được kích hoạt thành công.</p>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              </div>

              <div className="success-details">
                {subscriptionPlans.find(plan => plan.id.toString() === selectedPlan) && (
                  <>
                    <div className="success-detail-item">
                      <span className="success-detail-label">Gói:</span>
                      <span className="success-detail-value">
                        {subscriptionPlans.find(plan => plan.id.toString() === selectedPlan)?.name}
                      </span>
                    </div>
                    <div className="success-detail-item">
                      <span className="success-detail-label">Thời hạn:</span>
                      <span className="success-detail-value">
                        {subscriptionPlans.find(plan => plan.id.toString() === selectedPlan)?.duration} tháng
                      </span>
                    </div>
                  </>
                )}
                <div className="success-detail-item">
                  <span className="success-detail-label">Ngày kích hoạt:</span>
                  <span className="success-detail-value">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="success-button" onClick={closeAllModals}>Tiếp tục</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Failure Modal */}
      {showPaymentFailureModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container payment-failure-modal">
            <div className="modal-header">
              <h3>Thanh toán không thành công</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="failure-icon">
                <X size={48} color="#dc3545" />
              </div>
              <p>{paymentFailureMessage}</p>
              <p>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
            </div>
            <div className="modal-footer">
              <button className="confirm-button" onClick={closeAllModals}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Details Modal */}
      {showSubscriptionDetails && selectedSubscription && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-container subscription-details-modal">
            <div className="modal-header">
              <h3>Chi tiết gói đăng ký</h3>
              <button className="close-button" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="subscription-details">
                <div className="subscription-plan-header">
                  <h4 className="subscription-plan-name">{selectedSubscription.name}</h4>
                  <div className="subscription-plan-badge">Đã đăng ký</div>
                </div>

                <div className="subscription-status">
                  <div className="subscription-status-icon">
                    <Check size={24} />
                  </div>
                  <div className="subscription-status-text">
                    Gói đăng ký của bạn đang hoạt động
                  </div>
                </div>

                <div className="subscription-info-item">
                  <div className="subscription-info-label">Giá gói:</div>
                  <div className="subscription-info-value">{formatPrice(selectedSubscription.price)}</div>
                </div>

                <div className="subscription-info-item">
                  <div className="subscription-info-label">Thời hạn:</div>
                  <div className="subscription-info-value">{selectedSubscription.duration} tháng</div>
                </div>

                <div className="subscription-info-item">
                  <div className="subscription-info-label">Ngày bắt đầu:</div>
                  <div className="subscription-info-value">
                    {new Date().toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="subscription-info-item">
                  <div className="subscription-info-label">Ngày kết thúc:</div>
                  <div className="subscription-info-value">
                    {(() => {
                      const endDate = new Date();
                      endDate.setMonth(endDate.getMonth() + selectedSubscription.duration);
                      return endDate.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </div>
                </div>

                <div className="subscription-auto-renew">
                  <div className="auto-renew-checkbox checked">
                    <Check size={16} />
                  </div>
                  <div className="auto-renew-text">
                    Tự động gia hạn khi hết hạn
                  </div>
                </div>

                <div className="subscription-features-title">Tính năng bao gồm:</div>
                <ul className="subscription-features-list">
                  {selectedSubscription.features.map((feature, index) => (
                    <li key={index} className="subscription-feature-item">
                      <Check className="feature-check" size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={closeAllModals}>Hủy tự động gia hạn</button>
              <button className="confirm-button" onClick={closeAllModals}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upgrade;
