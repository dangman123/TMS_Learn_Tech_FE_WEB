import React, { useEffect, useState, useMemo } from "react";

import "./TestHistory.css";
import { TestHistoryNav } from "./ComponentTest/TestHistoryNav";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import saveAs from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import DocumentHistory from "../Component/DocumentHistory"; // Import component Lịch sử tải tài liệu

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

type TabType = "test" | "login" | "document";

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
    <div id="historyTest" className="col-md-9 ml-sm-auto col-lg-10 px-md-4">
      {/* Tab Navigation */}
      <div className="history-tabs-header">
        <div className="history-tabs">
          <button
            className={`history-tab ${activeTab === "test" ? "active" : ""}`}
            onClick={() => handleTabChange("test")}
          >
            <i className="fas fa-clipboard-check tab-icon"></i>
            <span className="tab-text">Lịch sử làm bài</span>
          </button>

          <button
            className={`history-tab ${
              activeTab === "document" ? "active" : ""
            }`}
            onClick={() => handleTabChange("document")}
          >
            <i className="fas fa-file-download tab-icon"></i>
            <span className="tab-text">Lịch sử tải tài liệu</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="history-tabs-content">
        {/* Tab Lịch sử làm bài */}
        {activeTab === "test" && (
          <>
            <hr />
            <TestHistoryNav
              onSearch={setSearchKeyword}
              size={size}
              setSize={handleSizeChange}
              onFilterByTime={setFilterByTime}
            />
            <hr />

            {/* Cập nhật phần body của bảng trong TestHistory.tsx */}
            <div className="table-responsive test-history-user">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th scope="col" className="col-stt">
                      STT
                    </th>
                    <th scope="col" className="col-ten-bai-kiem-tra">
                      Tên bài kiểm tra
                    </th>
                    <th scope="col" className="col-diem">
                      Điểm
                    </th>
                    <th scope="col" className="col-diem">
                      Số câu đúng
                    </th>
                    <th scope="col" className="col-thoi-gian">
                      Thời gian
                    </th>
                    <th scope="col" className="col-xoa">
                      Tải xuống
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="loading-container">
                          <div className="loading-spinner"></div>
                          <span className="loading-text">
                            Đang tải dữ liệu...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="no-data-message">
                          <i className="fas fa-inbox"></i>
                          <p>Không có dữ liệu</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((result, index) => (
                      <tr key={result.id}>
                        <th scope="row" className="col-stt">
                          {index + 1 + page * size}
                        </th>
                        <td>{result.testTitle}</td>
                        <td className="col-diem">{result.score.toFixed(1)}</td>
                        <td className="col-diem">
                          {result.correctAnswers}/{result.totalQuestions}
                        </td>
                        <td className="col-thoi-gian">
                          {new Date(result.completedAt).toLocaleString()}
                        </td>
                        <td className="col-tai-xuong">
                          <button
                            className="btn-link text-danger"
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

            {/* Cập nhật phân trang */}

            <div className="pegi justify-content-center mt-60">
              <a
                href="#0"
                onClick={() => handlePageChange(page - 1)}
                className={`border-none ${page === 0 ? "disabled" : ""}`}
              >
                <i className="fa-regular fa-arrow-left primary-color transition"></i>
              </a>
              {[...Array(totalPages)].map((_, index) => (
                <a
                  key={index}
                  href="#0"
                  onClick={() => handlePageChange(index)}
                  className={index === page ? "active" : ""}
                >
                  {index + 1}
                </a>
              ))}
              <a
                href="#0"
                onClick={() => handlePageChange(page + 1)}
                className={`border-none ${
                  page === totalPages - 1 ? "disabled" : ""
                }`}
              >
                <i className="fa-regular fa-arrow-right primary-color transition"></i>
              </a>
            </div>
          </>
        )}

        {/* Tab Lịch sử tải tài liệu */}
        {activeTab === "document" && <DocumentHistory />}
      </div>
    </div>
  );
};

export default TestHistory;
