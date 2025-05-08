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
    <div id="payHistory" className="container-fluid">
      <div className="row mt-4">
        {/* Thêm card hiển thị số dư ví */}
        <div className="col-md-4">
          <div className="card text-white bg-info mb-3">
            <div className="card-header">Tổng số bài thi</div>
            <div className="card-body">
              <h5 className="card-title">{totalExams.toLocaleString()}</h5>
              <p className="card-text">Tổng số bài thi đã mua</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-header">Tổng số giao dịch</div>
            <div className="card-body">
              <h5 className="card-title">{totalTransactions}</h5>
              <p className="card-text">Tổng số giao dịch đã thực hiện</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-header">Tổng số tiền</div>
            <div className="card-body">
              <h5 className="card-title">{totalAmount.toLocaleString()} VND</h5>
              <p className="card-text">Tổng số tiền đã thanh toán</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "payment" ? "active" : ""
                    }`}
                    href="#payment-tab"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange("payment");
                    }}
                  >
                    Lịch sử thanh toán
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "deposit" ? "active" : ""
                    }`}
                    href="#deposit-tab"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange("deposit");
                    }}
                  >
                    Lịch sử nạp tiền
                  </a>
                </li>
                {/* Thêm tab lịch sử mua bài thi */}
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "exam" ? "active" : ""
                    }`}
                    href="#exam-tab"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange("exam");
                    }}
                  >
                    Lịch sử mua bài thi
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === "payment" ? (
                // Tab lịch sử thanh toán
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Ngày thanh toán</th>
                        <th>Số tiền</th>
                        <th>Số lượng khóa học</th>
                        <th>Phương thức thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Đang tải dữ liệu...
                          </td>
                        </tr>
                      ) : paymentHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Không có dữ liệu.
                          </td>
                        </tr>
                      ) : (
                        paymentHistory.map((payment, index) => (
                          <tr
                            key={payment.paymentId}
                            onClick={() => handlePaymentClick(payment)}
                            style={{ cursor: "pointer" }}
                          >
                            <th scope="row">{index + 1 + page * size}</th>
                            <td>
                              {new Date(payment.paymentDate).toLocaleString()}
                            </td>
                            <td>{payment.totalPayment.toLocaleString()} VND</td>
                            <td>{payment.courseCount}</td>
                            <td>{payment.paymentMethod}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                      Trang trước
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={paymentHistory.length < size}
                    >
                      Trang sau
                    </button>
                  </div>
                </>
              ) : activeTab === "deposit" ? (
                // Tab lịch sử nạp tiền
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Ngày nạp tiền</th>
                        <th>Số tiền</th>
                        <th>Phương thức nạp</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Đang tải dữ liệu...
                          </td>
                        </tr>
                      ) : depositHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">
                            Không có dữ liệu.
                          </td>
                        </tr>
                      ) : (
                        depositHistory.map((deposit, index) => (
                          <tr key={deposit.depositId}>
                            <th scope="row">
                              {index + 1 + depositPage * size}
                            </th>
                            <td>
                              {new Date(deposit.depositDate).toLocaleString()}
                            </td>
                            <td>{deposit.amount.toLocaleString()} VND</td>
                            <td>{deposit.method}</td>
                            <td>
                              <span
                                className={`badge ${
                                  deposit.status === "Thành công"
                                    ? "bg-success"
                                    : deposit.status === "Đang xử lý"
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                              >
                                {deposit.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(depositPage - 1)}
                      disabled={depositPage === 0}
                    >
                      Trang trước
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(depositPage + 1)}
                      disabled={depositHistory.length < size}
                    >
                      Trang sau
                    </button>
                  </div>
                </>
              ) : (
                // Tab lịch sử mua bài thi
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Ngày mua</th>
                        <th>Tên bài thi</th>
                        <th>Loại bài thi</th>
                        <th>Giá tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            Đang tải dữ liệu...
                          </td>
                        </tr>
                      ) : examPurchaseHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center">
                            Không có dữ liệu.
                          </td>
                        </tr>
                      ) : (
                        examPurchaseHistory.map((exam, index) => (
                          <tr key={exam.purchaseId}>
                            <th scope="row">{index + 1 + examPage * size}</th>
                            <td>
                              {new Date(exam.purchaseDate).toLocaleString()}
                            </td>
                            <td>{exam.examTitle}</td>
                            <td>{exam.examType}</td>
                            <td>{exam.price.toLocaleString()} VND</td>
                            <td>
                              <span
                                className={`badge ${
                                  exam.status === "Đã hoàn thành"
                                    ? "bg-success"
                                    : exam.status === "Đang làm bài"
                                    ? "bg-warning"
                                    : exam.status === "Chưa làm"
                                    ? "bg-info"
                                    : "bg-danger"
                                }`}
                              >
                                {exam.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(examPage - 1)}
                      disabled={examPage === 0}
                    >
                      Trang trước
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePageChange(examPage + 1)}
                      disabled={examPurchaseHistory.length < size}
                    >
                      Trang sau
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedPayment && (
        <div className="modal-payment show d-block" tabIndex={-1} role="dialog">
          <div className="modal-payment-dialog" role="document">
            <div className="modal-payment-content payment-history">
              <div className="modal-payment-header">
                <h5 className="modal-payment-title">Chi tiết giao dịch</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-payment-body">
                <h3 style={{ textAlign: "center" }}>Chi tiết giao dịch</h3>

                <p>
                  <strong>Người mua:</strong> {user.fullname}
                </p>
                <p>
                  <strong>Số lượng:</strong> {selectedPayment.courseCount}
                </p>
                <p>
                  <strong>Ngày thanh toán:</strong>{" "}
                  {new Date(selectedPayment.paymentDate).toLocaleString()}
                </p>
                <p>
                  <strong>Phương thức thanh toán:</strong>{" "}
                  {selectedPayment.paymentMethod}
                </p>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "center" }}>STT</th>
                      <th style={{ textAlign: "center" }}>Khóa học</th>
                      <th style={{ textAlign: "center" }}>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetailHistory.map((item, index) => (
                      <tr key={item.courseId}>
                        <th style={{ textAlign: "center" }}>{index + 1}</th>
                        <td
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src={item.imageUrl}
                            alt=""
                            width={100}
                            height={60}
                          />
                          {item.courseTitle}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {item.price.toLocaleString()} VND
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ textAlign: "right" }}>
                  <strong>Tổng tiền:</strong>{" "}
                  {selectedPayment.totalPayment.toLocaleString()} VND
                </p>
              </div>
              <div className="modal-payment-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
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
