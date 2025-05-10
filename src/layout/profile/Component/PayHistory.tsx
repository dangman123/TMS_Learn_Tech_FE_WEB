import React, { useEffect, useState } from "react";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import "./payment-history.css";
export interface PaymentHistory {
  paymentId: number;
  paymentDate: string;
  totalPayment: number;
  courseCount: number;
  paymentMethod: string;
}
interface PaymentDetailHistory {
  courseId: number;
  courseTitle: string;
  imageUrl: string;
  price: number;
}

// Thêm interface cho lịch sử nạp tiền
interface DepositHistory {
  depositId: number;
  depositDate: string;
  amount: number;
  method: string;
  status: string;
}

// Thêm interface cho lịch sử mua bài thi
interface ExamPurchaseHistory {
  purchaseId: number;
  purchaseDate: string;
  examTitle: string;
  examType: string;
  price: number;
  status: string;
}

function PayHistory() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentDetailHistory, setPaymentDetailHistory] = useState<
    PaymentDetailHistory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Thêm state mới
  const [activeTab, setActiveTab] = useState("payment"); // "payment", "deposit" hoặc "exam"
  const [walletBalance, setWalletBalance] = useState(0);
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([]);
  const [depositPage, setDepositPage] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalDepositAmount, setTotalDepositAmount] = useState(0);

  // Thêm state cho lịch sử mua bài thi
  const [examPurchaseHistory, setExamPurchaseHistory] = useState<
    ExamPurchaseHistory[]
  >([]);
  const [examPage, setExamPage] = useState(0);
  const [totalExams, setTotalExams] = useState(0);
  const [totalExamAmount, setTotalExamAmount] = useState(0);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/summary?accountId=${user.id}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data.content || []);
        setTotalTransactions(data.totalElements || 0);
        setTotalAmount(
          data.content.reduce(
            (sum: number, item: PaymentHistory) => sum + item.totalPayment,
            0
          )
        ); // Tính tổng số tiền
      } else {
        console.error("Failed to fetch payment history:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm function lấy số dư ví
  const fetchWalletBalance = async () => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/wallet/balance?accountId=${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance || 0);
      } else {
        console.error("Failed to fetch wallet balance:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  // Thêm function lấy lịch sử nạp tiền
  const fetchDepositHistory = async () => {
    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/wallet/deposits?accountId=${user.id}&page=${depositPage}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepositHistory(data.content || []);
        setTotalDeposits(data.totalElements || 0);
        setTotalDepositAmount(
          data.content.reduce(
            (sum: number, item: DepositHistory) => sum + item.amount,
            0
          )
        );
      } else {
        console.error("Failed to fetch deposit history:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm function lấy lịch sử mua bài thi
  const fetchExamPurchaseHistory = async () => {
    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/exams/purchases?accountId=${user.id}&page=${examPage}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExamPurchaseHistory(data.content || []);
        setTotalExams(data.totalElements || 0);
        setTotalExamAmount(
          data.content.reduce(
            (sum: number, item: ExamPurchaseHistory) => sum + item.price,
            0
          )
        );
      } else {
        console.error(
          "Failed to fetch exam purchase history:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching exam purchase history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();

    if (activeTab === "payment") {
      fetchPaymentHistory();
    } else if (activeTab === "deposit") {
      fetchDepositHistory();
    } else if (activeTab === "exam") {
      fetchExamPurchaseHistory();
    }
  }, [page, depositPage, examPage, size, activeTab]);

  const handlePageChange = (newPage: number) => {
    if (activeTab === "payment") {
      if (newPage >= 0) {
        setPage(newPage);
      }
    } else if (activeTab === "deposit") {
      if (newPage >= 0) {
        setDepositPage(newPage);
      }
    } else if (activeTab === "exam") {
      if (newPage >= 0) {
        setExamPage(newPage);
      }
    }
  };

  const fetchPaymentDetailHistory = async (paymentId: number) => {
    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/payments/course-detail/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPaymentDetailHistory(data);
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (payment: PaymentHistory) => {
    fetchPaymentDetailHistory(payment.paymentId);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  // Xử lý chuyển tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div id="payHistory" className="container-fluid py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="text-primary fw-bold mb-2">Lịch sử giao dịch</h3>
          <p className="text-muted">
            Quản lý và theo dõi các giao dịch của bạn
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      {/* Dashboard Cards */}
      <div className="row mb-4">
        <div className="col-lg-4 col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-card">
            <div className="card-body p-0">
              <div className="d-flex">
                <div className="p-4 flex-grow-1">
                  <h6 className="text-muted mb-2">Bài thi đã mua</h6>
                  <h3 className="text-success fw-bold mb-0">
                    {totalExams.toLocaleString()}
                  </h3>
                </div>
                <div className="stats-icon bg-success text-white d-flex align-items-center justify-content-center">
                  <i className="bi bi-file-earmark-text fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-card">
            <div className="card-body p-0">
              <div className="d-flex">
                <div className="p-4 flex-grow-1">
                  <h6 className="text-muted mb-2">Tổng giao dịch</h6>
                  <h3 className="text-info fw-bold mb-0">
                    {totalTransactions}
                  </h3>
                </div>
                <div className="stats-icon bg-info text-white d-flex align-items-center justify-content-center">
                  <i className="bi bi-arrow-repeat fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-4 mb-3">
          <div className="card border-0 shadow-sm h-100 dashboard-card">
            <div className="card-body p-0">
              <div className="d-flex">
                <div className="p-4 flex-grow-1">
                  <h6 className="text-muted mb-2">Tổng chi tiêu</h6>
                  <h3 className="text-warning fw-bold mb-0">
                    {totalAmount.toLocaleString()} VND
                  </h3>
                </div>
                <div className="stats-icon bg-warning text-white d-flex align-items-center justify-content-center">
                  <i className="bi bi-cash-stack fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs & Tables Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="card-header bg-white pt-4 pb-0 border-0">
              <ul className="nav nav-tabs border-0" role="tablist">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "payment" ? "active fw-semibold" : ""
                    }`}
                    onClick={() => handleTabChange("payment")}
                  >
                    <i className="bi bi-credit-card me-2"></i>
                    Lịch sử thanh toán
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "deposit" ? "active fw-semibold" : ""
                    }`}
                    onClick={() => handleTabChange("deposit")}
                  >
                    <i className="bi bi-wallet-fill me-2"></i>
                    Lịch sử nạp tiền
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "exam" ? "active fw-semibold" : ""
                    }`}
                    onClick={() => handleTabChange("exam")}
                  >
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Lịch sử mua bài thi
                  </button>
                </li>
              </ul>
            </div>

            {/* Tab Content */}
            <div className="card-body p-0">
              <div className="tab-content p-4">
                {/* Tab 1: Lịch sử thanh toán */}
                {activeTab === "payment" && (
                  <div className="tab-pane fade show active">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="py-3 text-center">#</th>
                            <th className="py-3">Ngày thanh toán</th>
                            <th className="py-3">Số tiền</th>
                            <th className="py-3 text-center">
                              Số lượng khóa học
                            </th>
                            <th className="py-3">Phương thức thanh toán</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="text-center py-5">
                                <div className="spinner-border text-primary mb-2"></div>
                                <p className="text-muted mb-0">
                                  Đang tải dữ liệu...
                                </p>
                              </td>
                            </tr>
                          ) : paymentHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-5">
                                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                <p className="text-muted mb-0">
                                  Không có dữ liệu thanh toán
                                </p>
                              </td>
                            </tr>
                          ) : (
                            paymentHistory.map((payment, index) => (
                              <tr
                                key={payment.paymentId}
                                onClick={() => handlePaymentClick(payment)}
                                className="transaction-row"
                              >
                                <td className="text-center">
                                  {index + 1 + page * size}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                                      <i className="bi bi-bag-check text-primary"></i>
                                    </div>
                                    <div>
                                      <p className="mb-0 fw-medium">
                                        {new Date(
                                          payment.paymentDate
                                        ).toLocaleDateString("vi-VN", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                      <small className="text-muted">
                                        Thanh toán khóa học
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="fw-medium text-danger">
                                  -{payment.totalPayment.toLocaleString()} VND
                                </td>
                                <td className="text-center">
                                  <span className="badge bg-primary-light text-primary rounded-pill">
                                    {payment.courseCount} khóa học
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {payment.paymentMethod ===
                                      "Visa/Mastercard" && (
                                      <i className="bi bi-credit-card-2-front text-info me-2"></i>
                                    )}
                                    {payment.paymentMethod === "Ví điện tử" && (
                                      <i className="bi bi-wallet2 text-success me-2"></i>
                                    )}
                                    {payment.paymentMethod ===
                                      "Chuyển khoản" && (
                                      <i className="bi bi-bank text-warning me-2"></i>
                                    )}
                                    {payment.paymentMethod}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for payment history */}
                    {!loading && paymentHistory.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted">
                          Hiển thị {paymentHistory.length} / {totalTransactions}{" "}
                          giao dịch
                        </span>
                        <div className="d-flex">
                          <button
                            className="btn btn-outline-primary me-2 d-flex align-items-center"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                          >
                            <i className="bi bi-chevron-left me-1"></i>
                            Trang trước
                          </button>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={paymentHistory.length < size}
                          >
                            Trang sau
                            <i className="bi bi-chevron-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Lịch sử nạp tiền */}
                {activeTab === "deposit" && (
                  <div className="tab-pane fade show active">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="py-3 text-center">#</th>
                            <th className="py-3">Ngày nạp tiền</th>
                            <th className="py-3">Số tiền</th>
                            <th className="py-3">Phương thức nạp</th>
                            <th className="py-3 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="text-center py-5">
                                <div className="spinner-border text-primary mb-2"></div>
                                <p className="text-muted mb-0">
                                  Đang tải dữ liệu...
                                </p>
                              </td>
                            </tr>
                          ) : depositHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-5">
                                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                <p className="text-muted mb-0">
                                  Không có dữ liệu nạp tiền
                                </p>
                              </td>
                            </tr>
                          ) : (
                            depositHistory.map((deposit, index) => (
                              <tr
                                key={deposit.depositId}
                                className="transaction-row"
                              >
                                <td className="text-center">
                                  {index + 1 + depositPage * size}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                                      <i className="bi bi-cash-coin text-success"></i>
                                    </div>
                                    <div>
                                      <p className="mb-0 fw-medium">
                                        {new Date(
                                          deposit.depositDate
                                        ).toLocaleDateString("vi-VN", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                      <small className="text-muted">
                                        Nạp tiền vào ví
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="fw-medium text-success">
                                  +{deposit.amount.toLocaleString()} VND
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {deposit.method === "Visa/Mastercard" && (
                                      <i className="bi bi-credit-card-2-front text-info me-2"></i>
                                    )}
                                    {deposit.method === "Ví điện tử" && (
                                      <i className="bi bi-wallet2 text-success me-2"></i>
                                    )}
                                    {deposit.method === "Chuyển khoản" && (
                                      <i className="bi bi-bank text-warning me-2"></i>
                                    )}
                                    {deposit.method}
                                  </div>
                                </td>
                                <td className="text-center">
                                  <span
                                    className={`badge rounded-pill ${
                                      deposit.status === "Thành công"
                                        ? "bg-success-light text-success"
                                        : deposit.status === "Đang xử lý"
                                        ? "bg-warning-light text-warning"
                                        : "bg-danger-light text-danger"
                                    }`}
                                  >
                                    {deposit.status === "Thành công" && (
                                      <i className="bi bi-check-circle me-1"></i>
                                    )}
                                    {deposit.status === "Đang xử lý" && (
                                      <i className="bi bi-clock-history me-1"></i>
                                    )}
                                    {deposit.status !== "Thành công" &&
                                      deposit.status !== "Đang xử lý" && (
                                        <i className="bi bi-x-circle me-1"></i>
                                      )}
                                    {deposit.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for deposit history */}
                    {!loading && depositHistory.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted">
                          Hiển thị {depositHistory.length} / {totalDeposits}{" "}
                          giao dịch
                        </span>
                        <div className="d-flex">
                          <button
                            className="btn btn-outline-primary me-2 d-flex align-items-center"
                            onClick={() => handlePageChange(depositPage - 1)}
                            disabled={depositPage === 0}
                          >
                            <i className="bi bi-chevron-left me-1"></i>
                            Trang trước
                          </button>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => handlePageChange(depositPage + 1)}
                            disabled={depositHistory.length < size}
                          >
                            Trang sau
                            <i className="bi bi-chevron-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Lịch sử mua bài thi */}
                {activeTab === "exam" && (
                  <div className="tab-pane fade show active">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th className="py-3 text-center">#</th>
                            <th className="py-3">Ngày mua</th>
                            <th className="py-3">Tên bài thi</th>
                            <th className="py-3">Loại bài thi</th>
                            <th className="py-3">Giá tiền</th>
                            <th className="py-3 text-center">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="text-center py-5">
                                <div className="spinner-border text-primary mb-2"></div>
                                <p className="text-muted mb-0">
                                  Đang tải dữ liệu...
                                </p>
                              </td>
                            </tr>
                          ) : examPurchaseHistory.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-5">
                                <i className="bi bi-inbox fs-1 text-muted mb-3 d-block"></i>
                                <p className="text-muted mb-0">
                                  Không có dữ liệu bài thi
                                </p>
                              </td>
                            </tr>
                          ) : (
                            examPurchaseHistory.map((exam, index) => (
                              <tr
                                key={exam.purchaseId}
                                className="transaction-row"
                              >
                                <td className="text-center">
                                  {index + 1 + examPage * size}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="icon-wrapper bg-light rounded-circle p-2 me-3">
                                      <i className="bi bi-file-earmark-text text-info"></i>
                                    </div>
                                    <div>
                                      <p className="mb-0 fw-medium">
                                        {new Date(
                                          exam.purchaseDate
                                        ).toLocaleDateString("vi-VN", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                      <small className="text-muted">
                                        Mua bài thi
                                      </small>
                                    </div>
                                  </div>
                                </td>
                                <td className="fw-medium">{exam.examTitle}</td>
                                <td>
                                  <span className="badge bg-purple-light text-purple rounded-pill">
                                    {exam.examType}
                                  </span>
                                </td>
                                <td className="fw-medium text-danger">
                                  -{exam.price.toLocaleString()} VND
                                </td>
                                <td className="text-center">
                                  <span
                                    className={`badge rounded-pill ${
                                      exam.status === "Đã hoàn thành"
                                        ? "bg-success-light text-success"
                                        : exam.status === "Đang làm bài"
                                        ? "bg-warning-light text-warning"
                                        : exam.status === "Chưa làm"
                                        ? "bg-info-light text-info"
                                        : "bg-danger-light text-danger"
                                    }`}
                                  >
                                    {exam.status === "Đã hoàn thành" && (
                                      <i className="bi bi-check-circle me-1"></i>
                                    )}
                                    {exam.status === "Đang làm bài" && (
                                      <i className="bi bi-pencil-square me-1"></i>
                                    )}
                                    {exam.status === "Chưa làm" && (
                                      <i className="bi bi-hourglass me-1"></i>
                                    )}
                                    {exam.status !== "Đã hoàn thành" &&
                                      exam.status !== "Đang làm bài" &&
                                      exam.status !== "Chưa làm" && (
                                        <i className="bi bi-x-circle me-1"></i>
                                      )}
                                    {exam.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for exam history */}
                    {!loading && examPurchaseHistory.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <span className="text-muted">
                          Hiển thị {examPurchaseHistory.length} / {totalExams}{" "}
                          bài thi
                        </span>
                        <div className="d-flex">
                          <button
                            className="btn btn-outline-primary me-2 d-flex align-items-center"
                            onClick={() => handlePageChange(examPage - 1)}
                            disabled={examPage === 0}
                          >
                            <i className="bi bi-chevron-left me-1"></i>
                            Trang trước
                          </button>
                          <button
                            className="btn btn-outline-primary d-flex align-items-center"
                            onClick={() => handlePageChange(examPage + 1)}
                            disabled={examPurchaseHistory.length < size}
                          >
                            Trang sau
                            <i className="bi bi-chevron-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết thanh toán */}
      {isModalOpen && selectedPayment && (
        <div className="modal-payment show d-block" tabIndex={-1} role="dialog">
          <div className="modal-payment-dialog modal-lg">
            <div className="modal-payment-content border-0 shadow">
              <div className="modal-payment-header border-0 d-flex align-items-center p-4">
                <div className="modal-icon bg-primary-light rounded-circle p-3 me-3">
                  <i className="bi bi-receipt text-primary fs-5"></i>
                </div>
                <h5 className="modal-payment-title fw-bold m-0">
                  Chi tiết giao dịch
                </h5>
                <button
                  type="button"
                  className="btn-close ms-auto"
                  aria-label="Close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <div className="modal-payment-body p-4">
                <div className="bg-light rounded p-3 mb-4">
                  <div className="row">
                    <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                      <div className="detail-item">
                        <small className="text-muted d-block mb-1">
                          Người mua
                        </small>
                        <span className="fw-medium d-block">
                          {user.fullname}
                        </span>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                      <div className="detail-item">
                        <small className="text-muted d-block mb-1">
                          Số lượng khóa học
                        </small>
                        <span className="fw-medium d-block">
                          {selectedPayment.courseCount}
                        </span>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3 mb-md-0">
                      <div className="detail-item">
                        <small className="text-muted d-block mb-1">
                          Ngày thanh toán
                        </small>
                        <span className="fw-medium d-block">
                          {new Date(
                            selectedPayment.paymentDate
                          ).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                      <div className="detail-item">
                        <small className="text-muted d-block mb-1">
                          Phương thức thanh toán
                        </small>
                        <span className="fw-medium d-block d-flex align-items-center">
                          {selectedPayment.paymentMethod ===
                            "Visa/Mastercard" && (
                            <i className="bi bi-credit-card-2-front text-info me-2"></i>
                          )}
                          {selectedPayment.paymentMethod === "Ví điện tử" && (
                            <i className="bi bi-wallet2 text-success me-2"></i>
                          )}
                          {selectedPayment.paymentMethod === "Chuyển khoản" && (
                            <i className="bi bi-bank text-warning me-2"></i>
                          )}
                          {selectedPayment.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-list-ul me-2"></i>
                  Danh sách khóa học
                </h6>

                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th
                          className="py-3 text-center"
                          style={{ width: "5%" }}
                        >
                          #
                        </th>
                        <th className="py-3" style={{ width: "65%" }}>
                          Khóa học
                        </th>
                        <th className="py-3 text-end" style={{ width: "30%" }}>
                          Giá
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="text-center py-4">
                            <div className="spinner-border text-primary"></div>
                          </td>
                        </tr>
                      ) : (
                        paymentDetailHistory.map((item, index) => (
                          <tr key={item.courseId}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="course-image me-3 rounded overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    width={80}
                                    height={50}
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                                <div className="course-info">
                                  <p className="mb-0 fw-medium">
                                    {item.courseTitle}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="text-end fw-medium">
                              {item.price.toLocaleString()} VND
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-light">
                      <tr>
                        <td colSpan={2} className="text-end fw-bold">
                          Tổng cộng:
                        </td>
                        <td className="text-end fw-bold text-danger">
                          {selectedPayment.totalPayment.toLocaleString()} VND
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="modal-payment-footer d-flex justify-content-end p-4 bg-light">
                <button
                  type="button"
                  className="btn btn-primary px-4 d-flex align-items-center"
                  onClick={() => setIsModalOpen(false)}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayHistory;
