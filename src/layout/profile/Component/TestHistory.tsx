import React, { useEffect, useState, useMemo } from "react";
import "../style.css";
import { TestHistoryNav } from "./ComponentTest/TestHistoryNav";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import saveAs from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
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
const TestHistory = () => {
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

  // const fetchTestResultsDownload = async (testResultId: number) => {
  //   let token = localStorage.getItem("authToken");

  //   if (isTokenExpired(token)) {
  //     token = await refresh();
  //     if (!token) {
  //       window.location.href = "/dang-nhap";
  //       return;
  //     }
  //     localStorage.setItem("authToken", token);
  //   }
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_SERVER_HOST}/api/test-results/download-test?accountId=${user.id}&testResultId=${testResultId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`, // Đính kèm token
  //         },
  //       }
  //     );
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //     const data: TestResultDownload[] = await response.json();
  //     setTestResultsDownload(data);
  //   } catch (error: any) {
  //     console.error("Error fetching test results:", error);
  //   }
  // };

  const fetchTestResultsDownload = async (testResultId: number): Promise<TestResultDownload[]> => {
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
    fetchTestResults();
  }, [page, size]);

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

  const generateDocument = async (testResultId: number, testResult: TestResult) => {
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
                  q: { question: string; options: string[]; correctAnswer: string },
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
      {/* <TestHistoryNavTop onFilterByTime={setFilterByTime} /> */}
      <hr />
      <TestHistoryNav
        onSearch={setSearchKeyword}
        size={size}
        setSize={handleSizeChange}
        onFilterByTime={setFilterByTime}
      />
      <hr />

      <div className="table-responsive test-history-user">
        <table className="table table-striped table-sm">
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
              <th scope="col" className="col-diem">
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
                <td colSpan={6} className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              filteredResults.map((result, index) => (
                <tr key={result.id}>
                  <th scope="row">{index + 1 + page * size}</th>
                  <td>{result.testTitle}</td>
                  <td>{result.score.toFixed(1)}</td>
                  <td>
                    {result.correctAnswers}/{result.totalQuestions}
                  </td>
                  <td>{new Date(result.completedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-link text-danger"
                      onClick={() => generateDocument(result.id, result)}
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
          className={`border-none ${page === totalPages - 1 ? "disabled" : ""}`}
        >
          <i className="fa-regular fa-arrow-right primary-color transition"></i>
        </a>
      </div>
    </div>
  );
};

export default TestHistory;
