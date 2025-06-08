import React, { useEffect, useState, useMemo } from "react";
import styles from "./testHistory.module.css";
import { TestHistoryNav } from "./ComponentTest/TestHistoryNav";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import saveAs from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TextRun, TableRow, BorderStyle } from "docx";
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
  isChapterTest?: boolean;
  testTitle: string;
}

interface TestResultDownload {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  type: string;
}

type TabType = "test" | "document" | "exam";

// Thêm interface cho câu hỏi từ API
interface QuestionItem {
  questionId: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  result: string;
  resultCheck: string;
  instruction: string;
  level: string;
  type: string;
  topic: string;
  courseId: number;
  accountId: number;
}

interface TestData {
  testId: number;
  testTitle: string;
  lessonTitle: string | null;
  description: string;
  totalQuestion: number;
  type: string;
  duration: number;
  format: string;
  isChapterTest: boolean;
  courseId: number;
  lessonId: number | null;
  questionList: QuestionItem[];
}

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
    // Reset pagination khi chuyển tab
    setPage(0);
  };

  // Fetch Test Results
  const fetchTestResults = async () => {
    if (activeTab === "document") return;

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
        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/view-user?page=${page}&size=${size}&accountId=${user.id}&type=${activeTab}&search=${searchKeyword}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseData = await response.json();

      if (responseData.status === 200 && responseData.data) {
        setTestResults(responseData.data.content || []);
        setTotalPages(responseData.data.totalPages || 0);
      } else {
        setTestResults([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching test results:", error);
      setTestResults([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResultsDownload = async (
    testResultId: number,
    testId: number
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
        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/download-test?accountId=${user.id}&testId=${testId}&testResultId=${testResultId}`,
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
    if (activeTab === "test" || activeTab === "exam") {
      fetchTestResults();
    }
  }, [page, size, activeTab, searchKeyword]);

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

  // Hiển thị kết quả dưới dạng text
  const getResultText = (result: string) => {
    if (result === "Pass") return "Đạt";
    if (result === "Fail") return "Không đạt";
    return result;
  };

  // Lấy màu cho kết quả
  const getResultColor = (result: string) => {
    if (result === "Pass") return styles.resultPass;
    if (result === "Fail") return styles.resultFail;
    return "";
  };

  const generateDocument = async (
    testResultId: number,
    testResult: TestResult,
    testId: number
  ) => {
    await fetchTestResultsDownload(testResultId, testId);
    const data = await fetchTestResultsDownload(testResultId, testId);

    // Tạo đối tượng Document
    const doc = new Document({
      sections: [
        {
          children: [
            // Tiêu đề chính
            new Paragraph({
              children: [
                new TextRun({
                  text: `BÀI ${activeTab === "test" ? "KIỂM TRA" : "THI"}: ${testResult.testTitle}`,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
            }),

            // Thông tin bài kiểm tra
            new Paragraph({
              children: [
                new TextRun({
                  text: `Học viên: ${user.fullname}`,
                  size: 24,
                  bold: true
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({ text: `Email: ${user.email}`, size: 24 }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Điểm số: ${testResult.score.toFixed(1)}`,
                  size: 24,
                  bold: true
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Kết quả: ${getResultText(testResult.result)}`,
                  size: 24,
                  bold: true,
                  color: testResult.result === "Pass" ? "008000" : "FF0000",
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Số câu đúng: ${testResult.correctAnswers}/${testResult.totalQuestions}`,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),

            // // Dãy ô kết quả
            // new Paragraph({
            //   children: [
            //     new TextRun({
            //       text: "BẢNG ĐÁP ÁN",
            //       bold: true,
            //       size: 28,
            //     }),
            //   ],
            //   alignment: "center",
            //   spacing: { after: 300 },
            // }),

            // // Dãy ô đáp án đúng
            // new Paragraph({
            //   children: [
            //     new TextRun({
            //       text: "Đáp án đúng:   ",
            //       bold: true,
            //       size: 24,
            //     }),
            //     ...data.map((q, index) =>
            //       new TextRun({
            //         text: `${index + 1}: ${q.correctAnswer}   `,
            //         bold: true,
            //         size: 24,
            //         color: "008000",
            //       })
            //     ),
            //   ],
            //   spacing: { after: 200 },
            // }),

            // // Dãy ô đáp án của học viên
            // new Paragraph({
            //   children: [
            //     new TextRun({
            //       text: "Đáp án của bạn: ",
            //       bold: true,
            //       size: 24,
            //     }),
            //     ...data.map((q, index) => {
            //       const isCorrect = q.userAnswer === q.correctAnswer;
            //       return new TextRun({
            //         text: `${index + 1}: ${q.userAnswer || "_"}   `,
            //         bold: true,
            //         size: 24,
            //         color: q.userAnswer ? (isCorrect ? "008000" : "FF0000") : "000000",
            //       });
            //     }),
            //   ],
            //   spacing: { after: 500 },
            // }),

            // Tiêu đề danh sách câu hỏi
            new Paragraph({
              children: [
                new TextRun({
                  text: "CHI TIẾT CÂU HỎI",
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
            }),

            // Danh sách câu hỏi
            ...data.flatMap((q, index) => {
              // Mảng các phần tử sẽ trả về
              const elements = [
                // Câu hỏi
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Câu ${index + 1}: ${q.question}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              ];

              // Kiểm tra nếu là câu hỏi tự luận
              if (q.type === "essay") {
                // Thêm ghi chú tự luận
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Ghi chú: Tự luận",
                        italics: true,
                        size: 22,
                        color: "0000FF", // Màu xanh dương
                      }),
                    ],
                    spacing: { after: 300 },
                  })
                );
              }
              // Kiểm tra nếu là câu hỏi điền vào chỗ trống
              else if (q.type === "fill-in-the-blank") {
                // Hiển thị đáp án đúng và đáp án của học viên
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Ghi chú: Điền vào chỗ trống",
                        italics: true,
                        size: 22,
                        color: "0000FF", // Màu xanh dương
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Đáp án đúng: ${q.correctAnswer}`,
                        italics: true,
                        bold: true,
                        size: 22,
                        color: "008000",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Đáp án của bạn: ${q.userAnswer || "Chưa trả lời"}`,
                        italics: true,
                        bold: true,
                        size: 22,
                        color: q.userAnswer === q.correctAnswer ? "008000" : "FF0000",
                      }),
                    ],
                    spacing: { after: 300 },
                  })
                );
              }
              else {
                // Thêm các lựa chọn cho câu hỏi trắc nghiệm
                q.options.forEach((option, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isCorrect = optionLetter === q.correctAnswer;
                  const isUserAnswer = optionLetter === q.userAnswer;

                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${optionLetter}. ${option}`,
                          size: 22,
                          bold: isCorrect || isUserAnswer,
                          color: isCorrect ? "008000" : (isUserAnswer && !isCorrect ? "FF0000" : "000000"),
                        }),
                        ...(isCorrect ? [
                          new TextRun({
                            text: "  ✓",
                            size: 22,
                            bold: true,
                            color: "008000",
                          })
                        ] : []),
                        ...(isUserAnswer && !isCorrect ? [
                          new TextRun({
                            text: "  ✗",
                            size: 22,
                            bold: true,
                            color: "FF0000",
                          })
                        ] : []),
                      ],
                      spacing: { after: 100 },
                    })
                  );
                });

                if (q.type === "multiple-choice") {

                } else {
                  // Thêm kết quả câu hỏi
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Đáp án đúng: ${q.correctAnswer}`,
                          italics: true,
                          bold: true,
                          size: 22,
                          color: "008000",
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  );

                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Đáp án của bạn: ${q.userAnswer || "Chưa trả lời"}`,
                          italics: true,
                          bold: true,
                          size: 22,
                          color: q.userAnswer === q.correctAnswer ? "008000" : "FF0000",
                        }),
                      ],
                      spacing: { after: 300 },
                    })
                  );
                }

              }

              return elements;
            }),
          ],
        },
      ],
    });

    // Xuất file Word
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Bai${activeTab === "test" ? "KiemTra" : "Thi"}_${testResult.testTitle}.docx`);
  };

  // Hàm in đề thi
  const printTestExam = async (testId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/test-mobile/${testId}`,
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

      const responseData = await response.json();

      if (responseData.status === 200 && responseData.data) {
        const testData: TestData = responseData.data;
        generateTestExamDocument(testData);
      } else {
        console.error("Error fetching test data:", responseData.message);
      }
    } catch (error) {
      console.error("Error fetching test data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo file docx cho đề thi
  const generateTestExamDocument = async (testData: TestData) => {
    // Chuyển đổi thời gian từ giây sang phút:giây
    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Tạo đối tượng Document
    const doc = new Document({
      sections: [
        {
          children: [
            // Tiêu đề đề thi
            new Paragraph({
              children: [
                new TextRun({
                  text: `ĐỀ THI: ${testData.testTitle}`,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: "center",
              spacing: { after: 200 },
            }),

            // Thông tin đề thi
            new Paragraph({
              children: [
                new TextRun({
                  text: `Thời gian làm bài: ${formatDuration(testData.duration)} phút`,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Tổng số câu hỏi: ${testData.totalQuestion}`,
                  size: 24,
                }),
              ],
              spacing: { after: 200 },
            }),

            // Mô tả đề thi (nếu có)
            ...(testData.description ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Mô tả: ",
                    size: 24,
                    bold: true,
                  }),
                  new TextRun({
                    text: testData.description.replace(/<[^>]*>/g, ''), // Loại bỏ HTML tags
                    size: 24,
                  }),
                ],
                spacing: { after: 300 },
              }),
            ] : []),

            // Danh sách câu hỏi
            ...testData.questionList.flatMap((question, index) => {
              // Mảng các phần tử sẽ trả về
              const elements = [
                // Câu hỏi
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Câu ${index + 1}: ${question.content}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  spacing: { after: 200 },
                })
              ];

              // Xử lý theo loại câu hỏi
              if (question.type === "essay") {
                // Câu hỏi tự luận
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(Câu hỏi tự luận)",
                        italics: true,
                        size: 22,
                        color: "0000FF",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                // Thêm dòng trống để điền câu trả lời
                for (let i = 0; i < 5; i++) {
                  elements.push(
                    new Paragraph({
                      children: [new TextRun({ text: "" })],
                      spacing: { after: 100 },
                      border: {
                        bottom: {
                          color: "auto",
                          space: 1,
                          style: BorderStyle.SINGLE,
                          size: 1,
                        },
                      },
                    })
                  );
                }
              }
              else if (question.type === "fill-in-the-blank") {
                // Câu hỏi điền vào chỗ trống
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(Điền vào chỗ trống)",
                        italics: true,
                        size: 22,
                        color: "0000FF",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                // Thêm dòng trống để điền câu trả lời
                elements.push(
                  new Paragraph({
                    children: [new TextRun({ text: "" })],
                    spacing: { after: 100 },
                    border: {
                      bottom: {
                        color: "auto",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 1,
                      },
                    },
                  })
                );
              }
              else if (question.type === "multiple-choice") {
                // Câu hỏi trắc nghiệm
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(Chọn một đáp án đúng)",
                        italics: true,
                        size: 22,
                        color: "0000FF",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                // Thêm các lựa chọn
                const options = [
                  { letter: "A", text: question.optionA },
                  { letter: "B", text: question.optionB },
                  { letter: "C", text: question.optionC },
                  { letter: "D", text: question.optionD },
                ];

                options.forEach(option => {
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${option.letter}. ${option.text}`,
                          size: 22,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  );
                });
              }
              else if (question.type === "checkbox") {
                // Câu hỏi checkbox (nhiều lựa chọn)
                elements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "(Có thể chọn nhiều đáp án)",
                        italics: true,
                        size: 22,
                        color: "0000FF",
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                );

                // Thêm các lựa chọn với ô checkbox
                const options = [
                  { letter: "A", text: question.optionA },
                  { letter: "B", text: question.optionB },
                  { letter: "C", text: question.optionC },
                  { letter: "D", text: question.optionD },
                ];

                options.forEach(option => {
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `□ ${option.letter}. ${option.text}`,
                          size: 22,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  );
                });
              }
              else {
                // Loại câu hỏi khác - mặc định xử lý như trắc nghiệm
                const options = [
                  { letter: "A", text: question.optionA },
                  { letter: "B", text: question.optionB },
                  { letter: "C", text: question.optionC },
                  { letter: "D", text: question.optionD },
                ];

                options.forEach(option => {
                  elements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${option.letter}. ${option.text}`,
                          size: 22,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  );
                });
              }

              // Thêm khoảng cách giữa các câu hỏi
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: "" })],
                  spacing: { after: 200 },
                })
              );

              return elements;
            }),
          ],
        },
      ],
    });

    // Xuất file Word
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `DeThi_${testData.testTitle}.docx`);
  };

  // Format thời gian
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <span className={styles.tabText}>Lịch sử làm bài kiểm tra</span>
          </button>

          <button
            className={`${styles.tab} ${activeTab === "exam" ? styles.activeTab : ""}`}
            onClick={() => handleTabChange("exam")}
          >
            <i className={`fas fa-file-alt ${styles.tabIcon}`}></i>
            <span className={styles.tabText}>Lịch sử làm bài thi</span>
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
        {/* Tab Lịch sử làm bài kiểm tra hoặc bài thi */}
        {(activeTab === "test" || activeTab === "exam") && (
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
                    <th>Tên bài {activeTab === "test" ? "kiểm tra" : "thi"}</th>
                    <th className={styles.columnScore}>Điểm</th>
                    <th className={styles.columnCorrect}>Số câu đúng</th>
                    <th className={styles.columnResult}>Kết quả</th>
                    <th className={styles.columnTime}>Thời gian</th>
                    <th className={styles.columnDownload}>Tải xuống</th>
                    <th className={styles.columnDownload}>In đề thi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7}>
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
                      <td colSpan={7}>
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
                        <td className={`${styles.columnResult} ${getResultColor(result.result)}`}>
                          {getResultText(result.result)}
                        </td>
                        <td className={styles.columnTime}>
                          {formatDateTime(result.completedAt)}
                        </td>
                        <td className={styles.columnDownload}>
                          <button
                            className={styles.downloadButton}
                            onClick={() => generateDocument(result.id, result, result.testId)}
                            title={`Tải xuống bài ${activeTab === "test" ? "kiểm tra" : "thi"}`}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                        <td className={styles.columnDownload}>
                          <button
                            className={styles.downloadButton}
                            onClick={() => printTestExam(result.testId)}
                            title={`In đề thi`}
                          >
                            <i className="fas fa-print"></i>
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