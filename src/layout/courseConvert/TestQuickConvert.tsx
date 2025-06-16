import React, { useEffect, useState } from "react";
import "./CoursePageConvert.css";
import "./component/TestStyles.css";
import { Col } from "react-bootstrap";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { decryptData, encryptData } from "../util/encryption";
// import "./test.css";
import { Test_Lesson } from "./CoursePageConvert";
import Timer from "./component/Timer";
import LoadingSpinner from "./component/LoadingSpinner";
import ContentLoader from "./component/ContentLoader";
import SubmissionLoader from "./component/SubmissionLoader";
import { sendActionActivity } from "../../service/WebSocketActions";

// Custom CSS for better UI
const quickTestStyles = `
  .rbt-lesson-rightsidebar {
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .lesson-top-bar {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .lesson-top-bar h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: white;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.4;
    max-width: 80%;
  }

  .rbt-lesson-toggle button {
    background-color: rgba(255,255,255,0.2);
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s;
  }

  .rbt-lesson-toggle button:hover {
    background-color: rgba(255,255,255,0.3);
    transform: scale(1.05);
  }

  .rbt-single-quiz {
    background: white;
    border-radius: 12px;
    padding: 25px 30px;
    margin-bottom: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.04);
  }

  .rbt-single-quiz:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  .rbt-single-quiz h4 {
    color: #344767;
    font-weight: 700;
    font-size: 16px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 15px;
    margin-bottom: 25px;
    line-height: 1.5;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }

  .rbt-form-check {
    transition: all 0.3s;
    border: 1px solid #e9e9e9;
    border-radius: 10px;
    padding: 18px 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    background-color: #fafafa;
  }

  .rbt-form-check:hover {
    background-color: #f5f9ff;
    border-color: #d0e1ff;
    box-shadow: 0 3px 10px rgba(0,0,0,0.04);
  }

  .rbt-form-check input[type="radio"] {
    width: 22px;
    height: 22px;
    margin-right: 15px;
    accent-color: #4e73df;
    cursor: pointer;
  }

  .rbt-form-check label {
    font-size: 15px;
    font-weight: 500;
    color: #495057;
    cursor: pointer;
    width: 100%;
    margin-bottom: 0;
    display: flex;
    align-items: center;
  }

  .submit-btn button {
    padding: 14px 30px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    border-radius: 8px;
    letter-spacing: 0.5px;
  }

  .submit-btn button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  }

  .answer-review {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #2196f3;
    margin: 15px 0;
  }

  .correct {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 5px solid #4caf50;
  }

  .incorrect {
    background-color: rgba(244, 67, 54, 0.1);
    border-left: 5px solid #f44336;
  }

  .loading-spinner {
    border: 4px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top: 4px solid #fff;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 15px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .test-title {
    font-size: 16px;
    font-weight: 600;
    color: #344767;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    line-height: 1.4;
  }

  .test-time {
    background: rgba(78, 115, 223, 0.1);
    color: #4e73df;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .completed-test-badge {
    background-color: #4caf50;
    color: white;
    padding: 8px 15px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
  }

  .test-content-container {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
  
  @media (max-width: 768px) {
    .lesson-top-bar h5 {
      font-size: 14px;
      max-width: 70%;
    }
    
    .rbt-single-quiz h4 {
      font-size: 15px;
    }
    
    .test-title {
      font-size: 15px;
    }
    
    .rbt-form-check label {
      font-size: 14px;
    }
    
    .submit-btn button {
      font-size: 15px;
      padding: 12px 25px;
    }
  }
`;

// Thêm style cho textarea
const textareaBaseStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "15px",
  width: "100%",
  fontFamily: "inherit",
  transition: "all 0.3s",
  outline: "none"
};

const textareaEssayStyle = {
  ...textareaBaseStyle,
  minHeight: "160px",
  fontSize: "16px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};

const textareaFillStyle = {
  ...textareaBaseStyle,
  minHeight: "100px",
  fontSize: "16px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};

const textareaFocusHandler = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#4e73df";
  e.target.style.boxShadow = "0 0 0 3px rgba(78, 115, 223, 0.25)";
};

const textareaBlurHandler = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#ddd";
  e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
};

// Thêm style mới cho các component
const getFilterItemStyle = (isSelected: boolean) => ({
  display: "flex",
  alignItems: "center",
  background: isSelected ? "#e8f5e9" : "#f8f9fa",
  padding: "10px 18px",
  borderRadius: "30px",
  transition: "all 0.3s ease",
  boxShadow: isSelected ? "0 3px 8px rgba(76, 175, 80, 0.25)" : "0 1px 4px rgba(0,0,0,0.08)",
  cursor: "pointer",
  border: isSelected ? "1px solid #4caf50" : "1px solid transparent",
  fontWeight: isSelected ? "600" : "normal",
  fontSize: "15px"
});

const checkboxOptionStyle = {
  border: "1px solid #e9e9e9",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "10px",
  transition: "all 0.3s ease",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};

interface TestQuickConvertProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
  content: {
    test_id: number;
    type: "test";
    title: string;
  };
  progressCheck: ProgressCourses[];
  courseData?: CourseDataCourse[];
  shouldFetchQuestions?: boolean;
  setShouldFetchQuestions?: (value: boolean) => void;
}
export interface ProgressCourses {
  accountId: number;
  courseId: number;
  chapterId: number;
  lessonId: number;
  videoStatus: boolean;
  testStatus: boolean;
  testScore: number | null;
  chapterTest: boolean;
}
export interface Question {
  questionId: number;
  content: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  result: string | null;
  resultCheck: string | null;
  instruction: string;
  level: string;
  type: string; // "multiple-choice", "essay", "fill-in-the-blank", "checkbox"
  topic: string;
  courseId: number;
  accountId: number;
}
interface CorrectAnswer {
  id: number;
  instruction: string;
  correct_show: string;
  correct_check: string;
}

interface UserAnswers {
  testId: number;
  questionId: string;
  result: string;
}

interface Lesson {
  lesson_id: number;
  lesson_title: string;
  lesson_duration: number;
  completedLesson: boolean;
  video: {
    video_id: number;
    video_title: string;
    video_url: string;
    document_short: string | null;
    document_url: string | null;
  } | null;
  lesson_test: {
    test_id: number;
    test_title: string;
    test_type: string;
    durationTest: number;
    completedTestChapter: boolean | null;
  } | null;
  isRequired?: boolean;
  learningTip?: string | null;
  keyPoint?: string | null;
  overviewLesson?: string | null;
}

interface Chapter {
  chapter_id: number;
  chapter_title: string;
  lessons: Lesson[];
  chapter_test: {
    test_id: number;
    test_title: string;
    test_type: string;
    durationTest: number;
    completedTestChapter: boolean;
    isRequired?: boolean;
  } | null;
}

export interface CourseDataCourse {
  course_id: number;
  course_title: string;
  chapters: Chapter[];
}

interface ResponsiveDTO {
  accountId: number;
  chapterId: number;
  chapterTest: boolean;
  courseId: number;
  lessonId: number;
  testScore: number;
  testStatus: boolean;
  totalQuestion: number;
  videoStatus: boolean;
  userAnswers: UserAnswers[];
}

interface TestContent {
  test_id: number;
  type: "test";
  title: string;
  description?: string;
  duration?: number;
}

interface TestResponse {
  status: number;
  message: string;
  data: {
    testId: number;
    testTitle: string;
    lessonTitle: string | null;
    description: string | null;
    totalQuestion: number;
    type: string;
    duration: number;
    format: string;
    isChapterTest: boolean;
    courseId: number;
    lessonId: number | null;
    questionList: Question[];
  };
}

export const TestQuickConvert: React.FC<TestQuickConvertProps> = ({
  isSidebarOpen,
  handleToggleSidebar,
  content,
  progressCheck,
  courseData,
  shouldFetchQuestions,
  setShouldFetchQuestions,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const refresh = useRefreshToken();
  const [userAnswerTest, setUserAnswerTest] = useState<
    { testId: number; questionId: number; result: string }[] | null
  >(null);

  // Thêm state để lưu thời gian làm bài
  const [usedTime, setUsedTime] = useState<number>(0);
  const [testDuration, setTestDuration] = useState<number>(600); // Mặc định 10 phút
  const [isQuestionsLoaded, setIsQuestionsLoaded] = useState<boolean>(false); // Thêm state để kiểm tra đã load câu hỏi chưa

  // Thay đổi từ object sang string để chỉ chọn một loại tại một thời điểm
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("all");

  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const [correctAnswersShow, setCorrectAnswersShow] = useState<CorrectAnswer[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state để kiểm soát trạng thái đang nộp bài
  const [resultPayload, setResultPayload] = useState<ResponsiveDTO>();
  const testPayload = JSON.parse(localStorage.getItem("testPayload") || "{}");
  const [check, setCheck] = useState(testPayload || null);
  const [hasCompared, setHasCompared] = useState(false);
  const [testContent, setTestContent] = useState<{
    test_id: number;
    type: "test";
    title: string;
    description?: string;
    duration?: number;
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Add custom styles to document head when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = quickTestStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  // Hàm để cập nhật state với dữ liệu mới
  const updateResultPayload = (newData: ResponsiveDTO) => {
    setResultPayload(newData);
  };

  const fetchTestData = async (testId: number) => {
    let token = localStorage.getItem("authToken");
    console.log("data : ", courseData);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch test data. Status: ${response.status}`
        );
      }

      const testData = await response.json();
      setTestContent({
        test_id: testData.id,
        type: "test",
        title: testData.title,
        description: testData.description || "",
        duration: testData.duration
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };

  // Tách hàm fetchQuestions ra khỏi useEffect để có thể gọi riêng khi cần
  const fetchQuestions = async (testId: number) => {
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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch questions. Status: ${response.status}`
        );
      }

      const responseData: TestResponse = await response.json();
      console.log("API Response:", responseData);

      if (responseData.status === 200 && responseData.data) {
        setQuestions(responseData.data.questionList);

        // Lấy thời gian làm bài từ API nếu có
        if (responseData.data.duration) {
          setTestDuration(responseData.data.duration);
        }

        // Update test content
        setTestContent({
          test_id: responseData.data.testId,
          type: "test",
          title: responseData.data.testTitle,
          description: responseData.data.description || "",
          duration: responseData.data.duration
        });

        // Đánh dấu đã load câu hỏi
        setIsQuestionsLoaded(true);
      } else {
        throw new Error(`API returned error: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch thông tin cơ bản của bài test
    if (content.test_id) {
      fetchTestData(content.test_id);
    }

    // Kiểm tra xem có nên fetch câu hỏi không
    const hasStartedTest = localStorage.getItem("testStarted_" + content.test_id) === "true";

    // Only fetch questions if we don't already have them loaded
    if ((shouldFetchQuestions ||
      (localStorage.getItem("testIDSTORE") === content.test_id.toString() && !isQuestionsLoaded) ||
      hasStartedTest) && questions.length === 0) {

      fetchQuestions(content.test_id);

      // Reset shouldFetchQuestions sau khi đã fetch
      if (setShouldFetchQuestions) {
        setShouldFetchQuestions(false);
      }
    }
  }, [content.test_id, shouldFetchQuestions]);

  // Hàm cập nhật thời gian đã sử dụng
  const handleTimeUpdate = (time: number) => {
    setUsedTime(time);
  };

  const fetchCorrectAnswers = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/responsive-test/${content.test_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch correct answers. Status: ${response.status}`
        );
      }

      const data: CorrectAnswer[] = await response.json();
      setCorrectAnswers(data);
      setCheck(testPayload);
      // Đánh dấu là đã nộp bài để ẩn Timer
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error fetching correct answers:", error);
    }
  };

  const fetchTestDetails = async (testId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${content.test_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const testData = await response.json();
      return testData;
    } catch (error) {
      console.error("Error fetching test details:", error);
      return null;
    }
  };

  useEffect(() => {
    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: content.test_id,
      questionId: Number(questionId),
      result: answers[Number(questionId)],
    }));
    // Xóa việc gọi fetchCorrectAnswers() ở đây, vì chỉ cần gọi khi người dùng muốn xem đáp án
    setUserAnswerTest(userAnswers);
  }, [answers]);

  const submitTestAndUpdateProgress = async () => {
    if (!isAllQuestionsAnswered) {
      toast.error("Vui lòng hoàn thành các câu hỏi !");
      return;
    }

    // Đặt trạng thái đang gửi bài
    setIsSubmitting(true);

    const testData = await fetchTestDetails(content.test_id);

    if (!testData) {
      console.error("Failed to get test data.");
      setIsSubmitting(false); // Reset trạng thái nếu có lỗi
      return;
    }
    // Remove immediate submission - we'll only show answers when user clicks "View Answers"
    const authData = localStorage.getItem("authData");
    const accountId = authData ? JSON.parse(authData).id : null;
    const data = { "testId": content.test_id, "courseId": testData.course_id, "lessonId": null, "videoId": null, "action": "Nộp bài kiểm tra" + content.title }
    if (accountId) {
      sendActionActivity(accountId.toString(), "/app/submit_exam", data, "Nộp bài kiểm tra " + content.title)
    }
    // sendActionActivity(accountId, "/app/submit_exam", data, "Nộp bài kiểm tra " + content.title)






    // Tạo danh sách questionResponsiveList theo định dạng mới
    const questionResponsiveList = Object.keys(answers).map((questionId) => {
      const question = questions.find(q => q.questionId === Number(questionId));
      return {
        questionId: Number(questionId),
        result: answers[Number(questionId)],
        resultCheck: answers[Number(questionId)],
        type: question?.type || "multiple-choice"
      };
    });

    const totalQuestion = questions.length;

    // Tạo payload theo định dạng mới
    const payload = {
      testId: content.test_id,
      totalQuestion: totalQuestion,
      type: questions.map(q => q.type).filter((value, index, self) => self.indexOf(value) === index).join(", "),
      durationTest: usedTime, // Thời lượng tối đa của bài test
      // timeUsed: usedTime, // Thời gian thực tế học viên đã sử dụng (giây)
      courseId: testData.course_id,
      accountId: accountId,
      chapterId: testData.chapter_id,
      isChapterTest: testData.is_chapter_test || false,
      questionResponsiveList: questionResponsiveList,
    };

    localStorage.setItem("testPayload", JSON.stringify(payload));
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        setIsSubmitting(false); // Reset trạng thái nếu có lỗi
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/submit-answers`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("API Response:", responseData);

        if (responseData.status === 200) {
          const data = responseData.data;
          const score = data.rateTesting;
          const isPassed = data.resultTest === "Pass";
          const correctQuestions = data.correctQuestion;
          const incorrectQuestions = data.incorrectQuestion;
          const totalQuestions = data.totalQuestion;

          // Determine if this is the last test in the course (completed course)
          const isCompleted = false; // This would need to be determined by additional API data if available

          // Đặt lại trạng thái đang gửi bài
          setIsSubmitting(false);

          // Đặt isSubmitted = true để dừng Timer và hiển thị trạng thái đã hoàn thành
          setIsSubmitted(true);

          // Show result popup with detailed statistics
          showResultPopup(score, isPassed, isCompleted, false, {
            correctQuestions,
            incorrectQuestions,
            totalQuestions
          });
        } else {
          setIsSubmitting(false); // Reset trạng thái nếu có lỗi
          toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
        }
      } else if (response.status === 208) {
        // Status 208: Đã làm bài test này
        const responseData = await response.json();
        const data = responseData.data;
        const score = data.rateTesting;
        const isPassed = data.resultTest === "Pass";

        // Đặt lại trạng thái đang gửi bài
        setIsSubmitting(false);

        // Đặt isSubmitted = true để dừng Timer và hiển thị trạng thái đã hoàn thành
        setIsSubmitted(true);

        // Show result popup with "already taken" message
        showResultPopup(score, isPassed, false, true, undefined);
      } else {
        setIsSubmitting(false); // Reset trạng thái nếu có lỗi
        toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      setIsSubmitting(false); // Reset trạng thái nếu có lỗi
      toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
    }
  };

  // Hàm hiển thị popup thông báo kết quả
  const showResultPopup = (
    score: number,
    isPassed: boolean,
    isCompleted: boolean = false,
    isRetaken: boolean = false,
    statistics?: {
      correctQuestions?: number;
      incorrectQuestions?: number;
      totalQuestions?: number;
    }
  ) => {
    // Tạo style cho popup
    const popupStyle = document.createElement('style');
    popupStyle.innerHTML = `
      .result-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .result-popup {
        background-color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 500px;
        width: 90%;
      }
      .result-popup h2 {
        margin-top: 0;
        color: ${isPassed ? '#4caf50' : '#f44336'};
      }
      .result-popup .score {
        font-size: 48px;
        font-weight: bold;
        margin: 20px 0;
        color: ${isPassed ? '#4caf50' : '#f44336'};
      }
      .result-popup .statistics {
        background-color: #f5f5f5;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        text-align: left;
      }
      .result-popup .statistics-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .result-popup .statistics-item .label {
        font-weight: bold;
      }
      .result-popup .buttons {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 20px;
      }
      .result-popup button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s;
        min-width: 140px;
      }
      .result-popup .view-answers {
        background-color: #2196f3;
        color: white;
      }
      .result-popup .next-lesson {
        background-color: #4caf50;
        color: white;
      }
      .result-popup .retry {
        background-color: #f44336;
        color: white;
      }
      .result-popup button:hover {
        opacity: 0.9;
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(popupStyle);

    // Tạo popup element
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'result-popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'result-popup';

    // Xác định tiêu đề và nội dung dựa trên kết quả
    let title = '';
    let message = '';

    if (isRetaken) {
      title = isPassed ? 'Bài kiểm tra đã làm' : 'Bài kiểm tra đã làm';
      message = isPassed
        ? 'Bạn đã làm bài kiểm tra này và đạt yêu cầu.'
        : 'Bạn đã làm bài kiểm tra này nhưng chưa đạt yêu cầu.';
    } else {
      title = isPassed ? 'Chúc mừng!' : 'Chưa đạt';
      message = isPassed
        ? 'Bạn đã hoàn thành bài kiểm tra thành công.'
        : 'Bạn chưa đạt điểm yêu cầu.';
    }

    // Tạo nội dung HTML cho popup với thống kê chi tiết
    let statisticsHTML = '';
    if (statistics) {
      statisticsHTML = `
        <div class="statistics">
          <div class="statistics-item">
            <span class="label">Số câu đúng:</span>
            <span class="value">${statistics.correctQuestions || 0}/${statistics.totalQuestions || 0}</span>
          </div>
          <div class="statistics-item">
            <span class="label">Số câu sai:</span>
            <span class="value">${statistics.incorrectQuestions || 0}/${statistics.totalQuestions || 0}</span>
          </div>
        </div>
      `;
    }

    popup.innerHTML = `
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="score">${score.toFixed(1)}%</div>
      <p>Điểm của bạn</p>
      ${statisticsHTML}
      ${isCompleted ? '<p style="color: #4caf50; font-weight: bold;">Bạn đã hoàn thành khóa học!</p>' : ''}
      <div class="buttons">
        <button class="view-answers">Xem đáp án</button>
        <button class="view-results">Xem kết quả</button>
        ${isPassed ? '<button class="next-lesson">Qua bài tiếp theo</button>' : '<button class="retry">Làm lại</button>'}
      </div>
    `;

    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay);

    // Xử lý sự kiện cho các nút
    const viewAnswersBtn = popup.querySelector('.view-answers');
    const viewResultsBtn = popup.querySelector('.view-results');
    const nextLessonBtn = popup.querySelector('.next-lesson');
    const retryBtn = popup.querySelector('.retry');

    if (viewAnswersBtn) {
      viewAnswersBtn.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
        // Gọi hàm fetchCorrectAnswers để hiển thị đáp án
        fetchCorrectAnswers().then(() => {
          setIsSubmitted(true);
        });
      });
    }

    if (viewResultsBtn) {
      viewResultsBtn.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
        // Gọi hàm fetchCorrectAnswersShow để hiển thị kết quả
        fetchCorrectAnswersShow().then(() => {
          setIsSubmitted(true);
        });
      });
    }

    if (nextLessonBtn) {
      nextLessonBtn.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);

        try {
          // Lấy thông tin để chuyển sang bài tiếp theo
          const storedChapterId = localStorage.getItem("encryptedChapterId");
          const storedLessonId = localStorage.getItem("encryptedLessonId");

          if (!storedChapterId || !storedLessonId) {
            console.error("Missing encrypted chapter or lesson ID in localStorage");
            showToast("Không tìm thấy thông tin bài học tiếp theo.");
            return;
          }

          try {
            const chapterId = decryptData(storedChapterId);
            const lessonId = decryptData(storedLessonId);

            if (!chapterId || !lessonId) {
              console.error("Failed to decrypt chapter or lesson ID");
              showToast("Không thể giải mã thông tin bài học.");
              return;
            }

            if (!courseData) {
              console.error("courseData is undefined or null");
              showToast("Không có dữ liệu khóa học.");
              return;
            }

            navigateToLesson(
              "next",
              Number(chapterId),
              Number(lessonId),
              courseData,
              progressCheck
            );
          } catch (decryptError) {
            console.error("Error decrypting IDs:", decryptError);
            showToast("Lỗi khi giải mã thông tin bài học.");
          }
        } catch (error) {
          console.error("Error in next lesson button handler:", error);
          showToast("Đã xảy ra lỗi khi chuyển bài học.");
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
        handleRetry();
      });
    }
  };

  // Kiểm tra xem tất cả câu hỏi đã được trả lời chưa
  const isAllQuestionsAnswered = questions.length > 0 &&
    questions.every((q) => {
      // Câu hỏi essay không bắt buộc phải có đáp án
      if (q.type === "essay") return true;

      return !!answers[q.questionId];
    });

  const checkAnswer = (questionId: number): boolean => {
    const question = questions.find(q => q.questionId === questionId);
    if (!question) return false;

    const userAnswer = answers[questionId];
    if (!userAnswer) return false;

    // Kiểm tra theo từng loại câu hỏi
    switch (question.type) {
      case "multiple-choice":
        return userAnswer === question.resultCheck;

      case "checkbox":
        // So sánh các lựa chọn đã chọn với đáp án đúng
        const selectedOptions = userAnswer.split(",");
        const correctOptions = question.resultCheck?.split(",") || [];

        // Kiểm tra số lượng và từng phần tử
        return (
          selectedOptions.length === correctOptions.length &&
          selectedOptions.every(option => correctOptions.includes(option))
        );

      case "fill-in-the-blank":
        // Với điền khuyết, so sánh chính xác chuỗi
        return userAnswer.trim().toLowerCase() === question.resultCheck?.trim().toLowerCase();

      case "essay":
        // Câu hỏi tự luận không có đáp án đúng/sai cụ thể
        return true;

      default:
        return false;
    }
  };

  useEffect(() => {
    if (hasCompared) {
      localStorage.removeItem("testPayload");
      setHasCompared(false);
    }
  }, [hasCompared]);

  const fetchCorrectAnswersShow = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/responsive-test/${content.test_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch correct answers. Status: ${response.status}`
        );
      }

      const data: CorrectAnswer[] = await response.json();
      setCorrectAnswersShow(data);
      // Đánh dấu là đã nộp bài để ẩn Timer
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error fetching correct answers:", error);
    }
  };

  const checkPassFail = async (
    user: any,
    courseId: number,
    lessonId: number
  ): Promise<boolean> => {
    let token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return false;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const payload = {
        courseId: courseId,
        accountId: user?.id, // Lấy ID từ user
        lessonId: lessonId,
        chapterTest: false, // Giả định đây là kiểm tra bài học
      };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/progress/check-pass`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to check pass/fail. Status: ${response.status}`
        );
      }

      const data: boolean = await response.json();
      return data; // Server trả về true/false
    } catch (error) {
      console.error("Error checking pass/fail:", error);
      return false;
    }
  };

  const showAnswer = async () => {
    const storedEncryptedCourseId = localStorage.getItem("encryptedCourseId");
    const storedEncryptedLessonId = localStorage.getItem("encryptedLessonId");

    if (storedEncryptedCourseId && storedEncryptedLessonId) {
      const decryptedCourseId = decryptData(storedEncryptedCourseId);
      const decryptedLessonId = decryptData(storedEncryptedLessonId);

      const user = getUserData();
      if (user && decryptedCourseId && decryptedLessonId) {
        const isPassed = await checkPassFail(
          user,
          decryptedCourseId,
          decryptedLessonId
        );
        // console.log("ggg");
        if (isPassed) {
          fetchCorrectAnswersShow();
          setIsSubmitted(true);
        } else {
          toast.error("Bài kiểm tra chưa đạt! Hãy làm bài kiểm tra!");
        }
      } else {
        toast.error("Không thể giải mã dữ liệu bài học hoặc khóa học.");
      }
    } else {
      toast.error("Dữ liệu bài học hoặc khóa học bị thiếu.");
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  // Hàm xử lý khi người dùng chọn/bỏ chọn ô checkbox
  const handleCheckboxChange = (questionId: number, optionValue: string) => {
    console.log(`Checkbox clicked: Question ${questionId}, Option ${optionValue}`);

    // Lấy các giá trị đã chọn trước đó
    const currentSelected = answers[questionId]?.split(",") || [];
    console.log("Current selected:", currentSelected);

    // Kiểm tra xem optionValue đã được chọn chưa
    const index = currentSelected.indexOf(optionValue);

    let newSelected: string[];
    if (index >= 0) {
      // Nếu đã chọn rồi thì bỏ chọn
      newSelected = [...currentSelected];
      newSelected.splice(index, 1);
      console.log(`Removing option ${optionValue}`);
    } else {
      // Nếu chưa chọn thì thêm vào
      newSelected = [...currentSelected, optionValue];
      console.log(`Adding option ${optionValue}`);
    }

    // Sắp xếp và lọc giá trị rỗng
    newSelected = newSelected.filter(item => item).sort();
    console.log("New selected:", newSelected);

    // Cập nhật state
    setAnswers(prev => ({
      ...prev,
      [questionId]: newSelected.join(",")
    }));

    // Cập nhật userAnswerTest để hiển thị đáp án đã chọn
    const updatedUserAnswers = userAnswerTest ? [...userAnswerTest] : [];
    const existingAnswerIndex = updatedUserAnswers.findIndex(
      answer => answer.questionId === questionId
    );

    if (existingAnswerIndex >= 0) {
      updatedUserAnswers[existingAnswerIndex].result = newSelected.join(",");
    } else {
      updatedUserAnswers.push({
        testId: content.test_id,
        questionId: questionId,
        result: newSelected.join(",")
      });
    }

    setUserAnswerTest(updatedUserAnswers);
  };

  const handleGoBack = () => {
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedCourseId");
    localStorage.removeItem("encryptedLessonId");
    localStorage.removeItem("encryptedTestChapterId");
    localStorage.removeItem("encryptedChapterId");
    window.location.href = "/";
  };

  const submitTest = () => {
    setIsSubmitted(true);
  };

  const handleRetry = () => {
    // Logic làm lại bài
    // setIsSubmitted(false);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const findLessonIndex = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    try {
      // Check if courseData is valid
      if (!courseData) {
        console.error("Invalid courseData structure:", courseData);
        return null;
      }

      // Xử lý trường hợp courseData là một mảng
      const courseObj = Array.isArray(courseData) ? courseData[0] : courseData;

      if (!courseObj || !courseObj.chapters || !Array.isArray(courseObj.chapters)) {
        console.error("Invalid courseData structure:", courseObj);
        return null;
      }

      for (let i = 0; i < courseObj.chapters.length; i++) {
        const chapter = courseObj.chapters[i];
        if (chapter.chapter_id === chapterId) {
          // Make sure lessons array exists
          if (!chapter.lessons || !Array.isArray(chapter.lessons)) {
            console.error("Invalid chapter structure, missing lessons array:", chapter);
            return null;
          }

          const lessonIndex = chapter.lessons.findIndex(
            (lesson: any) => lesson.lesson_id === lessonId
          );

          // Only return valid indices
          if (lessonIndex !== -1) {
            return { chapterIndex: i, lessonIndex };
          }
        }
      }
      return null; // Không tìm thấy
    } catch (error) {
      console.error("Error in findLessonIndex:", error);
      return null;
    }
  };

  const getNextLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    try {
      // Xử lý trường hợp courseData là một mảng
      const courseObj = Array.isArray(courseData) ? courseData[0] : courseData;

      // Validate courseData
      if (!courseObj || !courseObj.chapters) {
        console.error("getNextLesson: Invalid courseData:", courseObj);
        return null;
      }

      const indices = findLessonIndex(chapterId, lessonId, courseData);
      if (!indices) {
        console.error("getNextLesson: Could not find lesson index for chapterId:", chapterId, "lessonId:", lessonId);
        return null;
      }

      const { chapterIndex, lessonIndex } = indices;

      // Validate chapter
      if (!courseObj.chapters[chapterIndex]) {
        console.error("getNextLesson: Invalid chapter at index:", chapterIndex);
        return null;
      }

      const currentChapter = courseObj.chapters[chapterIndex];

      // Validate lessons array
      if (!currentChapter.lessons || !Array.isArray(currentChapter.lessons)) {
        console.error("getNextLesson: Chapter has no valid lessons array:", currentChapter);
        return null;
      }

      // Bài học tiếp theo trong cùng một chương
      if (lessonIndex < currentChapter.lessons.length - 1) {
        return currentChapter.lessons[lessonIndex + 1];
      }

      // Chuyển sang bài học đầu tiên của chương kế tiếp
      if (chapterIndex < courseObj.chapters.length - 1) {
        const nextChapter = courseObj.chapters[chapterIndex + 1];

        // Validate next chapter's lessons
        if (!nextChapter.lessons || !nextChapter.lessons.length) {
          console.error("getNextLesson: Next chapter has no lessons:", nextChapter);
          return null;
        }

        return nextChapter.lessons[0];
      }

      return null; // Không có bài học tiếp theo
    } catch (error) {
      console.error("Error in getNextLesson:", error);
      return null;
    }
  };

  const getPreviousLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    try {
      // Validate courseData
      if (!courseData || !courseData.chapters) {
        console.error("getPreviousLesson: Invalid courseData:", courseData);
        return null;
      }

      const indices = findLessonIndex(chapterId, lessonId, courseData);
      if (!indices) {
        console.error("getPreviousLesson: Could not find lesson index for chapterId:", chapterId, "lessonId:", lessonId);
        return null;
      }

      const { chapterIndex, lessonIndex } = indices;

      // Validate chapter
      if (!courseData.chapters[chapterIndex]) {
        console.error("getPreviousLesson: Invalid chapter at index:", chapterIndex);
        return null;
      }

      const currentChapter = courseData.chapters[chapterIndex];

      // Validate lessons array
      if (!currentChapter.lessons || !Array.isArray(currentChapter.lessons)) {
        console.error("getPreviousLesson: Chapter has no valid lessons array:", currentChapter);
        return null;
      }

      // Bài học trước trong cùng một chương
      if (lessonIndex > 0) {
        return currentChapter.lessons[lessonIndex - 1];
      }

      // Chuyển sang bài học cuối cùng của chương trước đó
      if (chapterIndex > 0) {
        const prevChapter = courseData.chapters[chapterIndex - 1];

        // Validate previous chapter's lessons
        if (!prevChapter.lessons || !prevChapter.lessons.length) {
          console.error("getPreviousLesson: Previous chapter has no lessons:", prevChapter);
          return null;
        }

        return prevChapter.lessons[prevChapter.lessons.length - 1];
      }

      return null; // Không có bài học trước
    } catch (error) {
      console.error("Error in getPreviousLesson:", error);
      return null;
    }
  };

  const isLessonUnlocked = (
    chapterId: number,
    lessonId: number,
    progressData: any
  ) => {
    try {
      // Đầu tiên, kiểm tra xem bài học có bắt buộc không
      // Nếu courseData là một mảng, lấy phần tử đầu tiên
      const courseObj = Array.isArray(courseData) ? courseData[0] : courseData;

      if (courseObj && courseObj.chapters) {
        // Tìm chương
        const chapter = courseObj.chapters.find((c: any) => c.chapter_id === chapterId);
        if (chapter && chapter.lessons) {
          // Tìm bài học
          const lesson = chapter.lessons.find((l: any) => l.lesson_id === lessonId);

          // Nếu bài học không bắt buộc, cho phép truy cập
          if (lesson && lesson.isRequired === false) {
            console.log(`Lesson ${lessonId} is not required, allowing access`);
            return true;
          }
        }
      }

      // Tiếp tục kiểm tra dựa trên tiến trình
      if (!progressData || !Array.isArray(progressData)) {
        console.error("isLessonUnlocked: progressData is not an array:", progressData);
        return false;
      }

      const progress = progressData.find(
        (p: any) => p && p.chapterId === chapterId && p.lessonId === lessonId
      );

      if (!progress) {
        console.warn("isLessonUnlocked: No progress found for chapterId:", chapterId, "lessonId:", lessonId);
        return false;
      }

      return progress.videoStatus === true || progress.testStatus === true;
    } catch (error) {
      console.error("Error in isLessonUnlocked:", error);
      return false;
    }
  };

  const navigateToLesson = (
    direction: string,
    chapterId: number,
    lessonId: number,
    courseData: any,
    progressData: any
  ) => {
    try {
      // Validate input parameters
      if (!courseData) {
        console.error("navigateToLesson: courseData is undefined or null");
        showToast("Không thể chuyển bài học do thiếu dữ liệu khóa học.");
        return;
      }

      if (!progressData) {
        console.error("navigateToLesson: progressData is undefined or null");
        showToast("Không thể chuyển bài học do thiếu dữ liệu tiến trình.");
        return;
      }

      let targetLesson;

      if (direction === "next") {
        targetLesson = getNextLesson(chapterId, lessonId, courseData);
      } else if (direction === "previous") {
        targetLesson = getPreviousLesson(chapterId, lessonId, courseData);
      } else {
        console.error("navigateToLesson: Invalid direction:", direction);
        showToast("Hướng chuyển bài học không hợp lệ.");
        return;
      }

      if (!targetLesson) {
        showToast("Không có bài học để chuyển.");
        return;
      }

      // Ensure targetLesson has the expected properties
      if (!targetLesson.lesson_id) {
        console.error("navigateToLesson: targetLesson is missing lesson_id:", targetLesson);
        showToast("Dữ liệu bài học không hợp lệ.");
        return;
      }

      let isUnlocked = true; // Default to true for previous direction

      if (direction === "next") {
        isUnlocked = isLessonUnlocked(
          chapterId,
          targetLesson.lesson_id,
          progressData
        );

        if (!isUnlocked) {
          showToast("Bài học này chưa được mở khóa!");
          return;
        }
      }

      // Lấy video đầu tiên của bài học
      if (targetLesson.video && targetLesson.video.video_id) {
        // Lưu thông tin vào localStorage để chuyển hướng
        localStorage.setItem("encryptedVideoId", encryptData(targetLesson.video.video_id.toString()));
        localStorage.setItem("encryptedLessonId", encryptData(targetLesson.lesson_id.toString()));
        localStorage.setItem("encryptedChapterId", encryptData(chapterId.toString()));
        showToast(`Đang chuyển đến bài học: ${targetLesson.lesson_title || "Bài tiếp theo"}`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Nếu bài học không có video, kiểm tra xem có bài kiểm tra không
        if (targetLesson.lesson_test && targetLesson.lesson_test.test_id) {
          // Lưu thông tin vào localStorage để chuyển hướng
          localStorage.setItem("encryptedTestId", encryptData(targetLesson.lesson_test.test_id.toString()));
          localStorage.setItem("encryptedLessonId", encryptData(targetLesson.lesson_id.toString()));
          localStorage.setItem("encryptedChapterId", encryptData(chapterId.toString()));

          // Chuyển hướng đến trang làm bài kiểm tra
          showToast(`Đang chuyển đến bài kiểm tra: ${targetLesson.lesson_title || "Bài tiếp theo"}`);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Không có video hoặc bài kiểm tra
          showToast("Bài học tiếp theo không có nội dung.");
        }
      }
    } catch (error) {
      console.error("Error in navigateToLesson:", error);
      showToast("Đã xảy ra lỗi khi chuyển bài học.");
    }
  };

  const showToast = (message: string) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  // Tính toán số lượng câu hỏi mỗi loại
  const questionTypeCounts = questions.reduce((counts, question) => {
    const type = question.type as keyof typeof counts;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Thêm hàm xử lý khi người dùng thay đổi loại câu hỏi muốn hiển thị
  const handleQuestionTypeToggle = (type: string) => {
    // Nếu đang chọn loại này rồi, chuyển về 'all'
    // Nếu đang chọn loại khác, chuyển sang loại mới
    setSelectedQuestionType(prevType => prevType === type ? "all" : type);
  };

  // Hàm để kiểm tra xem một loại câu hỏi có được chọn không
  const isQuestionTypeSelected = (type: string): boolean => {
    return selectedQuestionType === "all" || selectedQuestionType === type;
  };

  // Lọc câu hỏi dựa theo loại đã chọn
  const filteredQuestions = questions.filter(question =>
    selectedQuestionType === "all" || question.type === selectedQuestionType
  );

  // Add custom styles to document head when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = quickTestStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      className="rbt-lesson-rightsidebar overflow-hidden"
      style={{ width: isSidebarOpen ? "75%" : "100%", flex: "1" }}
    >
      <div className="lesson-top-bar">
        <div className="lesson-top-left">
          <div className="rbt-lesson-toggle">
            <button
              title="Toggle Sidebar"
              onClick={handleToggleSidebar}
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <h5>{testContent?.title}</h5>
        </div>
        <div className="lesson-top-right">
          <div className="rbt-btn-close">
            <a
              href="/"
              title="Go Back to Course"
              className="rbt-round-btn"
              style={{
                width: "35px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                transition: "all 0.3s"
              }}
              onClick={(e) => {
                e.preventDefault();
                handleGoBack();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="inner" style={{ padding: "0px" }}>
        {isSubmitting && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "5px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                borderTopColor: "#fff",
                animation: "spin 1s ease-in-out infinite"
              }}
            ></div>
            <p style={{ 
              color: "white", 
              marginTop: "15px", 
              fontWeight: "bold",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)" 
            }}>Đang gửi bài kiểm tra...</p>
          </div>
        )}

        <div className="test-content-container">
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 0",
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%"
            }}>
              <h2 style={{ 
                fontSize: "24px", 
                marginBottom: "30px",
                color: "#344767" 
              }}>Đang tải bài kiểm tra...</h2>
              <div className="spinner-border" role="status" style={{ 
                width: "50px", 
                height: "50px",
                color: "#4e73df",
                borderWidth: "5px"
              }}>
                <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
          ) : (
            <>
              <div className="test-header">
                <div className="test-title">
                  {testContent?.title}
              </div>

                {!isSubmitted ? (
                  <div className="test-time">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                    </svg>
                    <Timer initialTime={testContent?.duration || testDuration} onTimeUpdate={handleTimeUpdate} />
          </div>
        ) : (
                  <div className="completed-test-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                    </svg>
                    Hoàn thành: {usedTime} phút
                  </div>
                )}
      </div>

              {/* Hiển thị thời gian đã sử dụng nếu đang làm bài */}
              {/* {usedTime > 0 && !isSubmitted && (
                <div style={{ 
                  textAlign: "right", 
                  marginBottom: "20px", 
                  fontSize: "14px", 
                  color: "#495057",
                  backgroundColor: "rgba(78, 115, 223, 0.1)",
                  display: "inline-block",
                  padding: "8px 15px",
                  borderRadius: "50px",
                  float: "right"
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stopwatch" viewBox="0 0 16 16" style={{ marginRight: "5px", verticalAlign: "text-top" }}>
                    <path d="M8.5 5.6a.5.5 0 1 0-1 0v2.9h-3a.5.5 0 0 0 0 1H8a.5.5 0 0 0 .5-.5V5.6z"/>
                    <path d="M6.5 1A.5.5 0 0 1 7 .5h2a.5.5 0 0 1 0 1v.57c1.36.196 2.594.78 3.584 1.64a.715.715 0 0 1 .012-.013l.354-.354-.354-.353a.5.5 0 0 1 .707-.708l1.414 1.415a.5.5 0 1 1-.707.707l-.353-.354-.354.354a.512.512 0 0 1-.013.012A7 7 0 1 1 7 2.071V1.5a.5.5 0 0 1-.5-.5zM8 3a6 6 0 1 0 .001 12A6 6 0 0 0 8 3z"/>
                  </svg>
                  Thời gian đã làm bài: {usedTime} phút
          </div>
              )} */}

              <div style={{ clear: "both" }}></div>

              <div className="rbt-dashboard-table table-responsive mt--30" style={{ width: "100%" }}>
            <form id="quiz-form" className="quiz-form-wrapper">
                  {questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="rbt-single-quiz"
                >
                      <h4 style={{ wordBreak: "break-word" }}>
                    Câu {index + 1}: {question.content}
                  </h4>
                    <div className="row g-3">
                        {["A", "B", "C", "D"].map((option, optionIndex) => {
                        const optionValue = question[`option${option}` as keyof Question];
                        if (!optionValue) return null;

                        const isCorrect = checkAnswer(question.questionId);
                        const isSelected = answers[question.questionId] === option;
                        const isSelectedCheck =
                          userAnswerTest?.find(
                              (pickme) => pickme.questionId === question.questionId
                            )?.result === option;
                          const isAnswerCorrect = correctAnswers.find(
                            (ans) => ans.id === question.questionId
                          )?.correct_check === option;

                        const optionClass = isSubmitted
                          ? isSelectedCheck
                            ? isAnswerCorrect
                              ? "correct"
                              : "incorrect"
                            : ""
                          : "";

                        return (
                          <div className="col-lg-6" key={option}>
                              <div className={`rbt-form-check ${optionClass}`}>
                              <input
                                type="radio"
                                name={`question-${question.questionId}`}
                                id={`question-${question.questionId}-${option}`}
                                checked={answers[question.questionId] === option}
                                onChange={() =>
                                  handleAnswerChange(question.questionId, option)
                                }
                                  disabled={isSubmitted}
                              />
                              <label
                                htmlFor={`question-${question.questionId}-${option}`}
                                    style={{ width: "100%", height: "100%", wordBreak: "break-word" }}
                              >
                                  <strong style={{ marginRight: "8px" }}>
                                  {option}.
                                </strong>
                                {optionValue}{" "}
                                  {isSubmitted && isAnswerCorrect && (
                                  <span
                                    className="answer-status"
                                    style={{
                                        fontWeight: "600",
                                      float: "right",
                                        color: "#4caf50",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(76, 175, 80, 0.1)"
                                    }}
                                  >
                                      Đúng
                                  </span>
                                )}
                                  {isSubmitted && isSelectedCheck && !isAnswerCorrect && (
                                  <span
                                    className="answer-status"
                                    style={{
                                        fontWeight: "600",
                                      float: "right",
                                        color: "#f44336",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: "rgba(244, 67, 54, 0.1)"
                                    }}
                                  >
                                      Sai
                                  </span>
                                )}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                        {isSubmitted &&
                          correctAnswers.map(
                            (correctAnswer) =>
                              correctAnswer.id === question.questionId && (
                                <div
                                  key={correctAnswer.id}
                                  className="answer-review"
                                >
                      <p>
                        <b>Giải thích: </b>
                                    {correctAnswer.instruction}
                      </p>
                    </div>
                              )
                  )}
                      </div>
                </div>
              ))}

                  <div className="submit-btn mt--20" style={{ textAlign: "center", marginTop: "40px", padding: "20px 0" }}>
                <button
                  type="button"
                  className="rbt-btn btn-gradient hover-icon-reverse"
                  style={{
                        background: isSubmitted 
                          ? "linear-gradient(135deg, #f44336 0%, #e53935 100%)" 
                          : "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                    color: "white",
                        padding: "15px 40px",
                        borderRadius: "30px",
                        fontSize: "16px",
                        fontWeight: "600",
                        letterSpacing: "0.5px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                  }}
                  onClick={
                    isSubmitted ? handleRetry : submitTestAndUpdateProgress
                  }
                      disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading-spinner" style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderRadius: "50%",
                        borderTopColor: "#fff",
                        animation: "spin 1s ease-in-out infinite",
                        marginRight: "10px",
                        verticalAlign: "middle"
                      }}></span>
                      Đang gửi bài...
                    </>
                  ) : (
                    isSubmitted ? "Làm bài lại" : "Nộp bài"
                  )}
                </button>
              </div>
            </form>
          </div>
            </>
          )}
      </div>
    </div>
    </div>
  );
};
