import React, { useEffect, useState, useMemo } from "react";
import styles from "./testHistory.module.css";
import { TestHistoryNav } from "./ComponentTest/TestHistoryNav";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import saveAs from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import DocumentHistory from "./DocumentHistory"; // Import component Lịch sử tải tài liệu

export interface TestResult {
  id: number;
  testId: number;
  accountId: number;
  courseId: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  completedAt: string;
  result: string;
  deletedDate: string | null;
  deleted: boolean;
  testTitle: string;
}
interface TestResultDownload {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}

type TabType = "test" | "document";

const TestHistory = () => {
  // State cho chức năng chuyển tab
  const [activeTab, setActiveTab] = useState<TabType>("test");

  // State cho TestHistory
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResultsDownload, setTestResultsDownload] = useState<
    TestResultDownload[]
  >([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size, setSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterByTime, setFilterByTime] = useState("year");
  const refresh = useRefreshToken();

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  const user = getUserData();

  // Xử lý chuyển tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Fetch Test Results
  const fetchTestResults = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/view-user?page=${page}&size=${size}&accountId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTestResults(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResultsDownload = async (
    testResultId: number
  ): Promise<TestResultDownload[]> => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return [];
      }
      localStorage.setItem("authToken", token);
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/download-test?accountId=${user.id}&testResultId=${testResultId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TestResultDownload[] = await response.json();
      setTestResultsDownload(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching test results:", error);
      return [];
    }
  };

  useEffect(() => {
    if (activeTab === "test") {
      fetchTestResults();
    }
  }, [page, size, activeTab]);

  // Kết hợp cả `filterByTime` và `searchKeyword`
  const filteredResults = useMemo(() => {
    let filtered = testResults;

    // Lọc theo thời gian
    const now = new Date();
    if (filterByTime === "today") {
      filtered = filtered.filter((result) => {
        const completedDate = new Date(result.completedAt);
        return completedDate.toDateString() === now.toDateString();
      });
    } else if (filterByTime === "lastday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((result) => {
        const completedDate = new Date(result.completedAt);
        return completedDate.toDateString() === yesterday.toDateString();
      });
    } else if (filterByTime === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((result) => {
        const completedDate = new Date(result.completedAt);
        return completedDate >= oneWeekAgo && completedDate <= now;
      });
    } else if (filterByTime === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((result) => {
        const completedDate = new Date(result.completedAt);
        return completedDate >= oneMonthAgo && completedDate <= now;
      });
    } else if (filterByTime === "year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter((result) => {
        const completedDate = new Date(result.completedAt);
        return completedDate >= oneYearAgo && completedDate <= now;
      });
    }

    // Lọc theo từ khóa
    if (searchKeyword.trim()) {
      filtered = filtered.filter((result) =>
        result.testTitle.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }, [filterByTime, searchKeyword, testResults]);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const generateDocument = async (
    testResultId: number,
    testResult: TestResult
  ) => {
    await fetchTestResultsDownload(testResultId);
    const data = await fetchTestResultsDownload(testResultId);
    const doc = new Document({
      sections: [
        {
          children: [
            // Tiêu đề chính
            new Paragraph({
              children: [
                new TextRun({
                  text: "Bảng Kết Quả Kiểm Tra",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: "center",
            }),

            // Thông tin bài kiểm tra
            new Paragraph({
              children: [
                new TextRun({ text: `Mã bài: ${testResult.testId}`, size: 24 }),
              ],
              alignment: "center",
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Học viên: ${user.fullname}`,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Email: ${user.email}`, size: 24 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Số điểm: ${testResult.score}`, size: 24 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Kết quả: ${testResult.result}`,
                  size: 24,
                  color: testResult.result === "Pass" ? "008000" : "FF0000",
                }),
              ],
            }),

            // Dòng trống để ngăn cách
            new Paragraph({}),

            // Tiêu đề danh sách câu hỏi
            new Paragraph({
              children: [
                new TextRun({
                  text: "Danh sách câu hỏi trắc nghiệm:",
                  bold: true,
                  size: 26,
                }),
              ],
              alignment: "center",
            }),

            // Danh sách câu hỏi
            ...data
              .map(
                (
                  q: {
                    question: string;
                    options: string[];
                    correctAnswer: string;
                  },
                  index: number
                ) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Câu ${index + 1}. ${q.question}`,
                        bold: true,
                        size: 24,
                      }),
                    ],
                  }),
                  ...q.options.map(
                    (option: string, idx: number) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${String.fromCharCode(65 + idx)}. ${option}`, // A, B, C, D
                            size: 22,
                          }),
                        ],
                      })
                  ),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Đáp án đúng: ${q.correctAnswer}`,
                        italics: true,
                        color: "008000",
                      }),
                    ],
                  }),
                  new Paragraph({}), // Thêm khoảng cách giữa các câu hỏi
                ]
              )
              .flat(),
          ],
        },
      ],
    });

    // Xuất file Word
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "BaiKiemTra.docx");
  };

  return (
    <div className={`${styles.historyContainer} col-md-12 col-lg-12 px-0`}>
      {/* Tab Navigation */}
      <div className={styles.tabsHeader}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "test" ? styles.activeTab : ""}`}
            onClick={() => handleTabChange("test")}
          >
            <i className={`fas fa-clipboard-check ${styles.tabIcon}`}></i>
            <span className={styles.tabText}>Lịch sử làm bài</span>
          </button>

          <button
            className={`${styles.tab} ${activeTab === "document" ? styles.activeTab : ""}`}
            onClick={() => handleTabChange("document")}
          >
            <i className={`fas fa-file-download ${styles.tabIcon}`}></i>
            <span className={styles.tabText}>Lịch sử tải tài liệu</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabsContent}>
        {/* Tab Lịch sử làm bài */}
        {activeTab === "test" && (
          <>
            <TestHistoryNav
              onSearch={setSearchKeyword}
              size={size}
              setSize={handleSizeChange}
              onFilterByTime={setFilterByTime}
            />

            {/* Bảng kết quả làm bài */}
            <div className={styles.tableContainer}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th className={styles.columnStt}>STT</th>
                    <th>Tên bài kiểm tra</th>
                    <th className={styles.columnScore}>Điểm</th>
                    <th className={styles.columnCorrect}>Số câu đúng</th>
                    <th className={styles.columnTime}>Thời gian</th>
                    <th className={styles.columnDownload}>Tải xuống</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.loadingContainer}>
                          <div className={styles.loadingSpinner}></div>
                          <span className={styles.loadingText}>
                            Đang tải dữ liệu...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.noDataContainer}>
                          <i className={`fas fa-inbox ${styles.noDataIcon}`}></i>
                          <p className={styles.noDataText}>Không có dữ liệu</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result, index) => (
                      <tr key={result.id}>
                        <td className={styles.columnStt}>
                          {index + 1 + page * size}
                        </td>
                        <td>{result.testTitle}</td>
                        <td className={styles.columnScore}>{result.score.toFixed(1)}</td>
                        <td className={styles.columnCorrect}>
                          {result.correctAnswers}/{result.totalQuestions}
                        </td>
                        <td className={styles.columnTime}>
                          {new Date(result.completedAt).toLocaleString()}
                        </td>
                        <td className={styles.columnDownload}>
                          <button
                            className={styles.downloadButton}
                            onClick={() => generateDocument(result.id, result)}
                            title="Tải xuống bài kiểm tra"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {filteredResults.length > 0 && (
              <div className={styles.pagination}>
                <a
                  href="#0"
                  onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
                  className={`${styles.paginationItem} ${styles.paginationArrow} ${page === 0 ? styles.paginationArrowDisabled : ''}`}
                >
                  <i className="fa-regular fa-arrow-left"></i>
                </a>
                {totalPages <= 7 ? (
                  // Hiển thị tất cả trang khi có ít trang
                  [...Array(totalPages)].map((_, index) => (
                    <a
                      key={index}
                      href="#0"
                      onClick={(e) => { e.preventDefault(); handlePageChange(index); }}
                      className={`${styles.paginationItem} ${index === page ? styles.paginationItemActive : ''}`}
                    >
                      {index + 1}
                    </a>
                  ))
                ) : (
                  // Logic phân trang cho nhiều trang
                  <>
                    {/* Luôn hiển thị trang đầu tiên */}
                    <a
                      href="#0"
                      onClick={(e) => { e.preventDefault(); handlePageChange(0); }}
                      className={`${styles.paginationItem} ${0 === page ? styles.paginationItemActive : ''}`}
                    >
                      1
                    </a>

                    {/* Hiển thị dấu "..." nếu trang hiện tại > 3 */}
                    {page > 3 && (
                      <span className={styles.paginationItem}>...</span>
                    )}

                    {/* Hiển thị các trang xung quanh trang hiện tại */}
                    {[...Array(totalPages)].map((_, index) => {
                      if (
                        (index > 0 && index < totalPages - 1) && // Không phải trang đầu hoặc cuối
                        (index >= page - 1 && index <= page + 1) // Trong phạm vi hiển thị
                      ) {
                        return (
                          <a
                            key={index}
                            href="#0"
                            onClick={(e) => { e.preventDefault(); handlePageChange(index); }}
                            className={`${styles.paginationItem} ${index === page ? styles.paginationItemActive : ''}`}
                          >
                            {index + 1}
                          </a>
                        );
                      }
                      return null;
                    })}

                    {/* Hiển thị dấu "..." nếu trang hiện tại < totalPages - 4 */}
                    {page < totalPages - 4 && (
                      <span className={styles.paginationItem}>...</span>
                    )}

                    {/* Luôn hiển thị trang cuối cùng */}
                    <a
                      href="#0"
                      onClick={(e) => { e.preventDefault(); handlePageChange(totalPages - 1); }}
                      className={`${styles.paginationItem} ${totalPages - 1 === page ? styles.paginationItemActive : ''}`}
                    >
                      {totalPages}
                    </a>
                  </>
                )}
                <a
                  href="#0"
                  onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
                  className={`${styles.paginationItem} ${styles.paginationArrow} ${page === totalPages - 1 ? styles.paginationArrowDisabled : ''}`}
                >
                  <i className="fa-regular fa-arrow-right"></i>
                </a>
              </div>
            )}
          </>
        )}

        {/* Tab Lịch sử tải tài liệu */}
        {activeTab === "document" && <DocumentHistory />}
      </div>
    </div>
  );
};

export default TestHistory;
