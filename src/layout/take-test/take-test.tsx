import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./take-test.module.css";
import usePreventDevTools from "../../hooks/usePreventDevTools";

// Sử dụng lazy loading cho component PopupResult
const PopupResult = lazy(() => import("./popup-result"));

interface Question {
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
  questionList: Question[];
}

interface TestResult {
  testId: number;
  correctQuestion: number;
  incorrectQuestion: number;
  score: number;
  totalQuestion: number;
  accountId: number;
  resultTest: string;
  rateTesting: number;
  durationTest: number;
  courseId: number;
}

interface UserAnswer {
  questionId: number;
  selectedOption: string | null; // For multiple-choice
  selectedOptions: string[]; // For checkbox
  essayAnswer: string; // For essay
  fillAnswer: string; // For fill-in-the-blank
  isMarked: boolean;
}

const TakeTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // Áp dụng hook chống DevTools khi đang làm bài thi
  // usePreventDevTools("Không được phép sử dụng công cụ phát triển trong quá trình làm bài thi!");

  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [testSubmitted, setTestSubmitted] = useState<boolean>(false);
  const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      let token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/questions/test-mobile/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === 200) {
          setTestData(response.data.data);
          setRemainingTime(response.data.data.duration);

          // Initialize user answers
          const initialAnswers: UserAnswer[] =
            response.data.data.questionList.map((q: Question) => ({
              questionId: q.questionId,
              selectedOption: null,
              selectedOptions: [],
              essayAnswer: "",
              fillAnswer: "",
              isMarked: false,
            }));

          setUserAnswers(initialAnswers);
        } else {
          setError(response.data.message || "Không thể tải dữ liệu bài thi");
        }
      } catch (err) {
        console.error("Error fetching test data:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu bài thi");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  // Timer effect
  useEffect(() => {
    if (!showInstructions && remainingTime > 0 && !testSubmitted) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showInstructions, testSubmitted]);

  // Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle option selection for multiple choice
  const handleOptionSelect = (questionId: number, option: string) => {
    setUserAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOption: option }
          : answer
      )
    );
  };

  // Handle checkbox selection (multiple answers)
  const handleCheckboxSelect = (questionId: number, option: string) => {
    setUserAnswers((prev) =>
      prev.map((answer) => {
        if (answer.questionId === questionId) {
          const selectedOptions = [...answer.selectedOptions];
          const optionIndex = selectedOptions.indexOf(option);

          if (optionIndex === -1) {
            selectedOptions.push(option);
          } else {
            selectedOptions.splice(optionIndex, 1);
          }

          return { ...answer, selectedOptions };
        }
        return answer;
      })
    );
  };

  // Handle essay answer
  const handleEssayAnswer = (questionId: number, text: string) => {
    setUserAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, essayAnswer: text }
          : answer
      )
    );
  };

  // Handle fill-in-the-blank answer
  const handleFillAnswer = (questionId: number, text: string) => {
    setUserAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, fillAnswer: text }
          : answer
      )
    );
  };

  // Handle marking question for review
  const handleMarkQuestion = (questionId: number) => {
    setUserAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, isMarked: !answer.isMarked }
          : answer
      )
    );
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < (testData?.questionList.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (testData?.questionList.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  // Calculate if all questions are answered
  const allQuestionsAnswered = () => {
    if (!testData) return false;

    return userAnswers.every((answer) => {
      // Check if any answer type is filled based on the question type
      const question = testData.questionList.find(q => q.questionId === answer.questionId);
      if (!question) return false;

      switch (question.type) {
        case "multiple-choice":
          return answer.selectedOption !== null;
        case "checkbox":
          return answer.selectedOptions.length > 0;
        case "essay":
          return answer.essayAnswer.trim() !== "";
        case "fill-in-the-blank":
          return answer.fillAnswer.trim() !== "";
        default:
          return false;
      }
    });
  };

  // Calculate progress
  const calculateProgress = () => {
    const answeredCount = userAnswers.filter((a) => {
      // Check if any answer type is filled
      return (
        a.selectedOption !== null ||
        a.selectedOptions.length > 0 ||
        a.essayAnswer.trim() !== "" ||
        a.fillAnswer.trim() !== ""
      );
    }).length;

    return testData ? (answeredCount / testData.questionList.length) * 100 : 0;
  };

  // Submit test
  const handleSubmitTest = async () => {
    // Clear any previous validation errors
    setValidationError(null);

    // Check if all questions are answered
    if (!allQuestionsAnswered()) {
      setValidationError("Bạn cần trả lời tất cả các câu hỏi trước khi nộp bài.");
      return;
    }

    if (confirmSubmit) {
      setTestSubmitted(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      let token = localStorage.getItem("authToken");
      const authData = localStorage.getItem("authData");
      const accountId = authData ? JSON.parse(authData).id : null;

      if (!accountId) {
        setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
        setTestSubmitted(false); // Allow retry
        return;
      }

      if (!testData) {
        setError("Dữ liệu bài thi không có sẵn để nộp.");
        setTestSubmitted(false);
        return;
      }

      try {
        const questionTypes = Array.from(
          new Set(testData.questionList.map((q) => q.type))
        ).join(",");

        const questionResponsiveList = userAnswers
          .map((answer) => {
            const question = testData.questionList.find(
              (q) => q.questionId === answer.questionId
            );
            if (!question) return null;

            let result = "";
            let resultCheck = "";

            switch (question.type) {
              case "multiple-choice":
                resultCheck = answer.selectedOption || "";
                if (resultCheck === "A") result = question.optionA;
                else if (resultCheck === "B") result = question.optionB;
                else if (resultCheck === "C") result = question.optionC;
                else if (resultCheck === "D") result = question.optionD;
                break;
              case "checkbox":
                resultCheck = answer.selectedOptions.sort().join(",");
                const selectedTexts = answer.selectedOptions
                  .map((opt) => {
                    if (opt === "1") return question.optionA;
                    if (opt === "2") return question.optionB;
                    if (opt === "3") return question.optionC;
                    if (opt === "4") return question.optionD;
                    return "";
                  })
                  .filter(Boolean);
                result = selectedTexts.join(", ");
                break;
              case "essay":
                result = answer.essayAnswer;
                resultCheck = ""; // Empty as per API requirement
                break;
              case "fill-in-the-blank":
                result = answer.fillAnswer;
                resultCheck = answer.fillAnswer;
                break;
              default:
                break;
            }

            return {
              questionId: answer.questionId,
              result: result,
              resultCheck: resultCheck,
              type: question.type,
            };
          })
          .filter((item) => item !== null);

        // Prepare submission data
        const submissionData = {
          testId: testData.testId,
          totalQuestion: testData.totalQuestion,
          type: questionTypes,
          durationTest: testData.duration - remainingTime,
          courseId: testData.courseId,
          accountId: accountId,
          chapterId: testData.lessonId,
          isChapterTest: testData.isChapterTest,
          questionResponsiveList: questionResponsiveList,
        };

        // Submit test results
        const response = await axios.post(
          `${process.env.REACT_APP_SERVER_HOST}/api/questions/submit-answers-exam`,
          submissionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.status === 200) {
          // Use a longer timeout to ensure DOM is ready
          setTimeout(() => {
            setTestResult(response.data.data);
          }, 100);
        } else {
          setError("Có lỗi khi nhận kết quả bài thi");
        }
      } catch (err) {
        console.error("Error submitting test:", err);
        setError("Đã xảy ra lỗi khi nộp bài thi");
      }
    } else {
      if (!allQuestionsAnswered()) {
        setValidationError("Bạn cần trả lời tất cả các câu hỏi trước khi nộp bài.");
        return;
      }
      setConfirmSubmit(true);
    }
  };

  // Start test
  const handleStartTest = () => {
    // Use setTimeout to prevent React suspense issues
    setTimeout(() => {
      setShowInstructions(false);
    }, 0);
  };

  // Render question based on type
  const renderQuestionContent = (
    question: Question,
    answer: UserAnswer | undefined
  ) => {
    switch (question.type) {
      case "multiple-choice":
        return (
          <div className={styles.optionsContainer}>
            <div
              className={`${styles.optionItem} ${answer?.selectedOption === "A" ? styles.selectedOption : ""
                }`}
              onClick={() => handleOptionSelect(question.questionId, "A")}
            >
              <div className={styles.optionMark}>A</div>
              <div className={styles.optionText}>{question.optionA}</div>
            </div>

            <div
              className={`${styles.optionItem} ${answer?.selectedOption === "B" ? styles.selectedOption : ""
                }`}
              onClick={() => handleOptionSelect(question.questionId, "B")}
            >
              <div className={styles.optionMark}>B</div>
              <div className={styles.optionText}>{question.optionB}</div>
            </div>

            <div
              className={`${styles.optionItem} ${answer?.selectedOption === "C" ? styles.selectedOption : ""
                }`}
              onClick={() => handleOptionSelect(question.questionId, "C")}
            >
              <div className={styles.optionMark}>C</div>
              <div className={styles.optionText}>{question.optionC}</div>
            </div>

            <div
              className={`${styles.optionItem} ${answer?.selectedOption === "D" ? styles.selectedOption : ""
                }`}
              onClick={() => handleOptionSelect(question.questionId, "D")}
            >
              <div className={styles.optionMark}>D</div>
              <div className={styles.optionText}>{question.optionD}</div>
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div className={styles.optionsContainer}>
            <div
              className={`${styles.checkboxItem} ${answer?.selectedOptions.includes("1")
                ? styles.selectedCheckbox
                : ""
                }`}
              onClick={() => handleCheckboxSelect(question.questionId, "1")}
            >
              <div className={styles.checkboxMark}>
                <input
                  type="checkbox"
                  checked={answer?.selectedOptions.includes("1") || false}
                  readOnly
                />
              </div>
              <div className={styles.optionText}>{question.optionA}</div>
            </div>

            <div
              className={`${styles.checkboxItem} ${answer?.selectedOptions.includes("2")
                ? styles.selectedCheckbox
                : ""
                }`}
              onClick={() => handleCheckboxSelect(question.questionId, "2")}
            >
              <div className={styles.checkboxMark}>
                <input
                  type="checkbox"
                  checked={answer?.selectedOptions.includes("2") || false}
                  readOnly
                />
              </div>
              <div className={styles.optionText}>{question.optionB}</div>
            </div>

            <div
              className={`${styles.checkboxItem} ${answer?.selectedOptions.includes("3")
                ? styles.selectedCheckbox
                : ""
                }`}
              onClick={() => handleCheckboxSelect(question.questionId, "3")}
            >
              <div className={styles.checkboxMark}>
                <input
                  type="checkbox"
                  checked={answer?.selectedOptions.includes("3") || false}
                  readOnly
                />
              </div>
              <div className={styles.optionText}>{question.optionC}</div>
            </div>

            <div
              className={`${styles.checkboxItem} ${answer?.selectedOptions.includes("4")
                ? styles.selectedCheckbox
                : ""
                }`}
              onClick={() => handleCheckboxSelect(question.questionId, "4")}
            >
              <div className={styles.checkboxMark}>
                <input
                  type="checkbox"
                  checked={answer?.selectedOptions.includes("4") || false}
                  readOnly
                />
              </div>
              <div className={styles.optionText}>{question.optionD}</div>
            </div>
          </div>
        );

      case "essay":
        return (
          <div className={styles.essayContainer}>
            <textarea
              className={styles.essayTextarea}
              value={answer?.essayAnswer || ""}
              onChange={(e) =>
                handleEssayAnswer(question.questionId, e.target.value)
              }
              placeholder="Nhập câu trả lời của bạn vào đây..."
              rows={10}
            />
          </div>
        );

      case "fill-in-the-blank":
        return (
          <div className={styles.fillContainer}>
            <input
              type="text"
              className={styles.fillInput}
              value={answer?.fillAnswer || ""}
              onChange={(e) =>
                handleFillAnswer(question.questionId, e.target.value)
              }
              placeholder="Nhập câu trả lời của bạn vào đây..."
            />
          </div>
        );

      default:
        return <div>Loại câu hỏi không được hỗ trợ</div>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải bài thi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Lỗi</h2>
        <p>{error}</p>
        <button
          className={styles.returnButton}
          onClick={() => navigate("/")}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy bài thi</h2>
        <button
          className={styles.returnButton}
          onClick={() => navigate("/")}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  // Display instructions
  if (showInstructions) {
    return (
      <div className={styles.instructionsContainer}>
        <div className={styles.instructionsCard}>
          <h1 className={styles.testTitle}>{testData.testTitle}</h1>

          <div className={styles.testInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thời gian:</span>
              <span className={styles.infoValue}>
                {testData.duration / 60} phút
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Số câu hỏi:</span>
              <span className={styles.infoValue}>{testData.totalQuestion}</span>
            </div>
          </div>

          <div
            className={styles.testDescription}
            dangerouslySetInnerHTML={{ __html: testData.description }}
          />

          <div className={styles.instructionsBox}>
            <h3>Hướng dẫn làm bài</h3>
            <ul>
              <li>Bài thi sẽ tự động nộp khi hết thời gian.</li>
              <li>Bạn có thể đánh dấu câu hỏi để xem lại sau.</li>
              <li>Đảm bảo đã trả lời tất cả câu hỏi trước khi nộp bài.</li>
              <li>Không được rời khỏi trang trong khi làm bài.</li>
            </ul>
          </div>

          <button className={styles.startButton} onClick={handleStartTest}>
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  // Current question
  const currentQuestion = testData.questionList[currentQuestionIndex];
  const currentAnswer = userAnswers.find(
    (a) => a.questionId === currentQuestion.questionId
  );

  return (
    <div className={styles.testContainer}>
      {" "}
      {/* Header */}
      <div className={styles.testHeader}>
        <a href="/" className={styles.ImgHeader}>
          <img src="/assets/images/logo/logoTMS.png" alt="logo" />
        </a>
        <h1 className={styles.testTitleSmall}>{testData.testTitle}</h1>
        <div className={styles.headerRight}>
          <div className={styles.timerContainer}>
            <div className={styles.timerIcon}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={styles.timer}>{formatTime(remainingTime)}</div>
          </div>
          <button
            className={styles.submitButtonHeader}
            onClick={handleSubmitTest}
            disabled={testSubmitted}
          >
            {confirmSubmit ? "Xác nhận nộp bài" : "Nộp bài"}
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className={styles.testContent}>
        {/* Left sidebar - Question navigation */}
        <div className={styles.questionNav}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <div className={styles.progressText}>
            Đã trả lời:{" "}
            {userAnswers.filter((a) => a.selectedOption !== null).length}/
            {testData.questionList.length}
          </div>

          <div className={styles.questionGrid}>
            {testData.questionList.map((_, index) => {
              const answer = userAnswers[index];
              let buttonClass = styles.questionButton;

              if (index === currentQuestionIndex) {
                buttonClass += ` ${styles.currentQuestion}`;
              }

              if (answer.selectedOption !== null) {
                buttonClass += ` ${styles.answeredQuestion}`;
              }

              if (answer.isMarked) {
                buttonClass += ` ${styles.markedQuestion}`;
              }

              return (
                <button
                  key={index}
                  className={buttonClass}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className={styles.legendContainer}>
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendColor} ${styles.currentColor}`}
              ></div>
              <span>Câu hiện tại</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendColor} ${styles.answeredColor}`}
              ></div>
              <span>Đã trả lời</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={`${styles.legendColor} ${styles.markedColor}`}
              ></div>
              <span>Đánh dấu</span>
            </div>
          </div>
        </div>

        {/* Main question area */}
        <div className={styles.questionContainer}>
          <div className={styles.questionHeader}>
            <div className={styles.questionNumber}>
              Câu {currentQuestionIndex + 1}/{testData.questionList.length}
            </div>
            <button
              className={`${styles.markButton} ${currentAnswer?.isMarked ? styles.marked : ""
                }`}
              onClick={() => handleMarkQuestion(currentQuestion.questionId)}
            >
              {currentAnswer?.isMarked ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
              <i
                className={`fas fa-bookmark ${currentAnswer?.isMarked ? styles.markedIcon : ""
                  }`}
              ></i>
            </button>
          </div>
          <div className={styles.questionContent}>
            <div
              className={styles.questionText}
              dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
            />

            {renderQuestionContent(currentQuestion, currentAnswer)}
          </div>
          <div className={styles.navigationButtons}>
            <button
              className={styles.navButton}
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <i className="fas fa-arrow-left"></i> Câu trước
            </button>

            <button
              className={styles.navButton}
              onClick={goToNextQuestion}
              disabled={
                currentQuestionIndex === testData.questionList.length - 1
              }
            >
              Câu sau <i className="fas fa-arrow-right"></i>
            </button>
          </div>{" "}
        </div>
      </div>
      {/* Validation error message */}
      {validationError && (
        <div className={styles.validationErrorContainer}>
          <div className={styles.validationError}>
            <i className="fas fa-exclamation-triangle"></i>
            <span>{validationError}</span>
            <button onClick={() => setValidationError(null)}>×</button>
          </div>
        </div>
      )}
      {/* Confirm dialog */}
      {confirmSubmit && !testResult && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Xác nhận nộp bài</h3>
            <p>
              Bạn đã trả lời{" "}
              {userAnswers.filter((a) =>
                a.selectedOption !== null ||
                a.selectedOptions.length > 0 ||
                a.essayAnswer.trim() !== "" ||
                a.fillAnswer.trim() !== ""
              ).length}/
              {testData.questionList.length} câu hỏi.
            </p>
            <p>Bạn có chắc chắn muốn nộp bài?</p>

            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmSubmitButton}
                onClick={handleSubmitTest}
              >
                Nộp bài
              </button>

              <button
                className={styles.confirmCancelButton}
                onClick={() => setConfirmSubmit(false)}
              >
                Tiếp tục làm bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Popup */}
      {testResult && (
        <Suspense fallback={<div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Đang tải kết quả...</p>
        </div>}>
          <PopupResult testResult={testResult} />
        </Suspense>
      )}
    </div>
  );
};

export default TakeTest;
