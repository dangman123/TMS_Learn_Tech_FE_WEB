import React, { useEffect, useState } from "react";
import "./CoursePageConvert.css";
import { Col } from "react-bootstrap";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { decryptData, encryptData } from "../util/encryption";
import "./test.css";
import { Test_Lesson } from "./CoursePageConvert";
import Timer from "./component/Timer";

// Thêm style cho textarea
const textareaBaseStyle = {
  border: "1px solid #ddd",
  borderRadius: "4px",
  padding: "10px",
  width: "100%",
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
  outline: "none"
};

const textareaEssayStyle = {
  ...textareaBaseStyle,
  minHeight: "120px"
};

const textareaFillStyle = {
  ...textareaBaseStyle,
  minHeight: "80px"
};

const textareaFocusHandler = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#6c63ff";
  e.target.style.boxShadow = "0 0 0 2px rgba(108, 99, 255, 0.2)";
};

const textareaBlurHandler = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  e.target.style.borderColor = "#ddd";
  e.target.style.boxShadow = "none";
};

// Thêm style mới cho các component
const getFilterItemStyle = (isSelected: boolean) => ({
  display: "flex",
  alignItems: "center",
  background: isSelected ? "#e6f7ff" : "#f5f5f5",
  padding: "8px 15px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
  boxShadow: isSelected ? "0 2px 5px rgba(108,170,255,0.25)" : "0 1px 3px rgba(0,0,0,0.1)",
  cursor: "pointer",
  border: isSelected ? "1px solid #1890ff" : "1px solid transparent"
});

const checkboxOptionStyle = {
  border: "1px solid #e9e9e9",
  borderRadius: "5px",
  padding: "10px",
  marginBottom: "5px",
  transition: "all 0.2s ease",
  cursor: "pointer"
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
  video: {
    video_id: number;
    video_title: string;
    video_url: string;
    document_short: string;
    document_url: string;
  } | null;
  lesson_test: {
    test_id: number;
    test_title: string;
    test_type: string;
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
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
        description: testData.description || ""
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
          description: responseData.data.description || ""
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
    console.log("check data : ", courseData);

    // Kiểm tra xem có nên fetch câu hỏi không
    // Nếu shouldFetchQuestions là true hoặc đã có dữ liệu câu hỏi từ trước
    const hasStartedTest = localStorage.getItem("testStarted_" + content.test_id) === "true";

    if (shouldFetchQuestions ||
      (localStorage.getItem("testIDSTORE") === content.test_id.toString() && !isQuestionsLoaded) ||
      hasStartedTest) {
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
        ${isPassed ? '<button class="next-lesson">Qua bài tiếp theo</button>' : '<button class="retry">Làm lại</button>'}
      </div>
    `;

    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay);

    // Xử lý sự kiện cho các nút
    const viewAnswersBtn = popup.querySelector('.view-answers');
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

  return (
    <div
      className="rbt-lesson-rightsidebar overflow-hidden"
      style={{ width: isSidebarOpen ? "100%" : "100%", flex: "1" }}
    >
      <div className="lesson-top-bar">
        <div className="lesson-top-left">
          <div className="rbt-lesson-toggle">
            <button
              style={{ color: "white" }}
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
          <h5 style={{ color: "white" }}>{testContent?.title}</h5>
        </div>
        <div className="lesson-top-right">
          <div className="rbt-btn-close">
            <a
              href="/"
              title="Go Back to Course"
              className="rbt-round-btn"
              style={{
                color: "white",
                width: "30px",
                height: "30px",
                textAlign: "center",
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

      {/* Loading overlay khi đang gửi bài */}
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
          <p style={{ color: "white", marginTop: "15px", fontWeight: "bold" }}>Đang gửi bài kiểm tra...</p>
          <style>
            {`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      <div className="inner" style={{ padding: " 0px" }}>
        <div
          className="content"
          style={{ padding: "40px 50px", width: "95%", margin: "0 auto" }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Đang tải bài kiểm tra...</h2>
            </div>
          ) : !isQuestionsLoaded ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Bài kiểm tra: {testContent?.title}</h2>
              {testContent?.description && (
                <div
                  style={{ fontSize: "16px", marginBottom: "15px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "5px", maxWidth: "800px", margin: "0 auto 20px" }}
                  dangerouslySetInnerHTML={{ __html: testContent.description }}
                />
              )}
              <p style={{ fontSize: "16px", marginBottom: "30px" }}>
                Hãy chuẩn bị sẵn sàng để làm bài kiểm tra. Bạn sẽ có {Math.floor(testDuration / 60)} phút để hoàn thành.
              </p>
              <button
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold"
                }}
                onClick={() => {
                  fetchQuestions(content.test_id);
                  // Lưu trạng thái đã bắt đầu làm bài
                  localStorage.setItem("testStarted_" + content.test_id, "true");
                }}
              >
                Bắt Đầu Làm Bài
              </button>
            </div>
          ) : (
            <>
              <div
                style={{ display: "flex", justifyContent: "right", gap: "10px" }}
              >
                {!isSubmitted ? (
                  <Timer initialTime={testDuration} onTimeUpdate={handleTimeUpdate} />
                ) : (
                  <div className="completed-test-badge" style={{
                    background: "#4caf50",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold"
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16" style={{ marginRight: "5px" }}>
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                    </svg>
                    Đã hoàn thành: {Math.floor(usedTime / 60)} phút
                  </div>
                )}
                {/* <button
                  type="button"
                  className="rbt-btn btn-gradient hover-icon-reverse"
                  style={{
                    background: "#4caf50",
                    color: "white",
                  }}
                  onClick={showAnswer}
                >
                  Hiển thị đáp án
                </button> */}
              </div>

              {/* Hiển thị thời gian đã sử dụng */}
              {usedTime > 0 && !isSubmitted && (
                <div style={{ textAlign: "right", marginTop: "5px", fontSize: "14px", color: "#666" }}>
                  Thời gian đã làm bài: {Math.floor(usedTime / 60)} phút {usedTime % 60} giây
                </div>
              )}

              <hr />
              <div className="question-type-filter" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h5 style={{ margin: 0 }}>Lọc loại câu hỏi:</h5>
                  <button
                    onClick={() => handleQuestionTypeToggle("all")}
                    style={{
                      background: selectedQuestionType === "all" ? "#4caf50" : "#e0e0e0",
                      color: selectedQuestionType === "all" ? "white" : "#333",
                      border: "none",
                      padding: "6px 15px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "all 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
                    }}
                  >
                    Hiển thị tất cả
                  </button>
                </div>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
                  <div
                    className="filter-item"
                    style={getFilterItemStyle(isQuestionTypeSelected("multiple-choice"))}
                    onClick={() => handleQuestionTypeToggle("multiple-choice")}
                    onMouseOver={(e) => {
                      if (!isQuestionTypeSelected("multiple-choice")) {
                        e.currentTarget.style.backgroundColor = "#eaf4ff";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isQuestionTypeSelected("multiple-choice")) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id="type-multiple-choice"
                      checked={isQuestionTypeSelected("multiple-choice")}
                      onChange={() => handleQuestionTypeToggle("multiple-choice")}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#4caf50",
                        cursor: "pointer"
                      }}
                    />
                    <label htmlFor="type-multiple-choice" style={{ marginLeft: "8px", marginBottom: "0", cursor: "pointer" }}>
                      Trắc nghiệm {questionTypeCounts['multiple-choice'] && <span style={{ marginLeft: "5px", background: "#4caf50", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "12px" }}>{questionTypeCounts['multiple-choice']}</span>}
                    </label>
                  </div>

                  <div
                    className="filter-item"
                    style={getFilterItemStyle(isQuestionTypeSelected("essay"))}
                    onClick={() => handleQuestionTypeToggle("essay")}
                    onMouseOver={(e) => {
                      if (!isQuestionTypeSelected("essay")) {
                        e.currentTarget.style.backgroundColor = "#eaf4ff";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isQuestionTypeSelected("essay")) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id="type-essay"
                      checked={isQuestionTypeSelected("essay")}
                      onChange={() => handleQuestionTypeToggle("essay")}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#2196f3",
                        cursor: "pointer"
                      }}
                    />
                    <label htmlFor="type-essay" style={{ marginLeft: "8px", marginBottom: "0", cursor: "pointer" }}>
                      Tự luận {questionTypeCounts['essay'] && <span style={{ marginLeft: "5px", background: "#2196f3", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "12px" }}>{questionTypeCounts['essay']}</span>}
                    </label>
                  </div>

                  <div
                    className="filter-item"
                    style={getFilterItemStyle(isQuestionTypeSelected("fill-in-the-blank"))}
                    onClick={() => handleQuestionTypeToggle("fill-in-the-blank")}
                    onMouseOver={(e) => {
                      if (!isQuestionTypeSelected("fill-in-the-blank")) {
                        e.currentTarget.style.backgroundColor = "#eaf4ff";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isQuestionTypeSelected("fill-in-the-blank")) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id="type-fill-in-the-blank"
                      checked={isQuestionTypeSelected("fill-in-the-blank")}
                      onChange={() => handleQuestionTypeToggle("fill-in-the-blank")}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#ff9800",
                        cursor: "pointer"
                      }}
                    />
                    <label htmlFor="type-fill-in-the-blank" style={{ marginLeft: "8px", marginBottom: "0", cursor: "pointer" }}>
                      Điền khuyết {questionTypeCounts['fill-in-the-blank'] && <span style={{ marginLeft: "5px", background: "#ff9800", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "12px" }}>{questionTypeCounts['fill-in-the-blank']}</span>}
                    </label>
                  </div>

                  <div
                    className="filter-item"
                    style={getFilterItemStyle(isQuestionTypeSelected("checkbox"))}
                    onClick={() => handleQuestionTypeToggle("checkbox")}
                    onMouseOver={(e) => {
                      if (!isQuestionTypeSelected("checkbox")) {
                        e.currentTarget.style.backgroundColor = "#eaf4ff";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isQuestionTypeSelected("checkbox")) {
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      id="type-checkbox"
                      checked={isQuestionTypeSelected("checkbox")}
                      onChange={() => handleQuestionTypeToggle("checkbox")}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#9c27b0",
                        cursor: "pointer"
                      }}
                    />
                    <label htmlFor="type-checkbox" style={{ marginLeft: "8px", marginBottom: "0", cursor: "pointer" }}>
                      Nhiều lựa chọn {questionTypeCounts['checkbox'] && <span style={{ marginLeft: "5px", background: "#9c27b0", color: "white", padding: "2px 6px", borderRadius: "10px", fontSize: "12px" }}>{questionTypeCounts['checkbox']}</span>}
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                  Đang hiển thị: <strong>{filteredQuestions.length}</strong> / {questions.length} câu hỏi
                  {selectedQuestionType !== "all" && (
                    <span style={{ marginLeft: "8px", color: "#1890ff" }}>
                      ➤ Loại: <strong>
                        {selectedQuestionType === "multiple-choice"
                          ? "Trắc nghiệm"
                          : selectedQuestionType === "essay"
                            ? "Tự luận"
                            : selectedQuestionType === "fill-in-the-blank"
                              ? "Điền khuyết"
                              : "Nhiều lựa chọn"
                        }
                      </strong>
                    </span>
                  )}
                </div>
              </div>
              <div
                className="rbt-dashboard-table table-responsive mobile-table-750 mt--30 overflow-hidden"
                style={{ marginTop: "30px" }}
              >
                <form id="quiz-form" className="quiz-form-wrapper">
                  {filteredQuestions.map((question, index) => (
                    <div
                      key={question.questionId}
                      className="rbt-single-quiz"
                      style={{ marginTop: "10px" }}
                    >
                      <h4 style={{ fontSize: "20px", marginBottom: "10px" }}>
                        Câu {index + 1}: {question.content}
                      </h4>

                      {/* Các loại câu hỏi khác nhau */}
                      {question.type === "multiple-choice" && (
                        <div className="row g-3">
                          {["A", "B", "C", "D"].map((option) => {
                            const optionValue = question[`option${option}` as keyof Question];
                            if (!optionValue) return null;

                            const isCorrect = checkAnswer(question.questionId);
                            const isSelected = answers[question.questionId] === option;
                            const isSelectedCheck =
                              userAnswerTest?.find(
                                (pickme) => pickme.questionId == question.questionId
                              )?.result == option;
                            const isAnswerCorrect = question.resultCheck === option;

                            const optionClass = isSubmitted
                              ? isSelectedCheck
                                ? isAnswerCorrect
                                  ? "correct"
                                  : "incorrect"
                                : ""
                              : "";

                            return (
                              <div className="col-lg-6" key={option}>
                                <div className="rbt-form-check">
                                  <input
                                    type="radio"
                                    name={`question-${question.questionId}`}
                                    id={`question-${question.questionId}-${option}`}
                                    checked={answers[question.questionId] === option}
                                    onChange={() =>
                                      handleAnswerChange(question.questionId, option)
                                    }
                                    disabled={isSubmitted} // Disable sau khi nộp bài
                                  />
                                  <label
                                    htmlFor={`question-${question.questionId}-${option}`}
                                    className={optionClass}
                                    style={{ width: "100%", height: "100%" }}
                                  >
                                    <strong style={{ marginRight: "2px" }}>
                                      {option}.
                                    </strong>
                                    {optionValue}{" "}
                                    {isSubmitted && (
                                      <span
                                        className="answer-status"
                                        style={{
                                          fontWeight: "900",
                                          float: "right",
                                          color: isAnswerCorrect ? "green" : "red", // Màu xanh cho đúng, màu đỏ cho sai
                                        }}
                                      >
                                        {isAnswerCorrect ? " (Đúng)" : " (Sai)"}
                                      </span>
                                    )}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Câu hỏi tự luận */}
                      {question.type === "essay" && (
                        <div className="row">
                          <div className="col-12">
                            <textarea
                              className="form-control"
                              placeholder="Nhập câu trả lời tự luận của bạn..."
                              rows={5}
                              disabled={isSubmitted}
                              value={answers[question.questionId] || ""}
                              onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                              style={textareaEssayStyle}
                              onFocus={textareaFocusHandler}
                              onBlur={textareaBlurHandler}
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Câu hỏi điền khuyết */}
                      {question.type === "fill-in-the-blank" && (
                        <div className="row">
                          <div className="col-12">
                            <textarea
                              className="form-control"
                              placeholder="Điền đáp án vào đây..."
                              rows={3}
                              disabled={isSubmitted}
                              value={answers[question.questionId] || ""}
                              onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                              style={textareaFillStyle}
                              onFocus={textareaFocusHandler}
                              onBlur={textareaBlurHandler}
                            ></textarea>
                            {isSubmitted && (
                              <div className="mt-2">
                                <strong>Đáp án đúng:</strong> {question.result}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Câu hỏi checkbox */}
                      {question.type === "checkbox" && (
                        <div className="row g-3">
                          {["A", "B", "C", "D"].map((option, optionIndex) => {
                            const optionValue = question[`option${option}` as keyof Question];
                            if (!optionValue) return null;

                            // Xử lý để kiểm tra xem option này có được chọn không
                            const selectedOptions = answers[question.questionId]?.split(",") || [];
                            const isSelected = selectedOptions.includes((optionIndex + 1).toString());

                            // Kiểm tra xem option này có phải đáp án đúng không
                            const correctOptions = question.resultCheck?.split(",") || [];
                            const isCorrect = correctOptions.includes((optionIndex + 1).toString());

                            const optionClass = isSubmitted
                              ? isSelected
                                ? isCorrect
                                  ? "correct"
                                  : "incorrect"
                                : ""
                              : "";

                            return (
                              <div className="col-lg-6" key={option}>
                                <div
                                  className="rbt-form-check"
                                  style={{
                                    border: "1px solid #e9e9e9",
                                    borderRadius: "5px",
                                    padding: "10px",
                                    marginBottom: "5px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    background: isSelected ? "#f0f5ff" : "", // Highlight nếu được chọn
                                    borderColor: isSelected ? "#6c63ff" : "#e9e9e9", // Border màu nếu được chọn
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = isSelected ? "#e6ecff" : "#f0f0f0";
                                    e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.15)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = isSelected ? "#f0f5ff" : "";
                                    e.currentTarget.style.boxShadow = "";
                                  }}
                                  onClick={(e) => {
                                    if (!isSubmitted) {
                                      const checkbox = document.getElementById(`question-${question.questionId}-${option}`) as HTMLInputElement;
                                      if (checkbox) {
                                        checkbox.checked = !checkbox.checked;
                                        handleCheckboxChange(question.questionId, (optionIndex + 1).toString());
                                      }
                                    }
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    name={`question-${question.questionId}`}
                                    id={`question-${question.questionId}-${option}`}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      e.stopPropagation(); // Ngăn sự kiện lan truyền lên div cha
                                      handleCheckboxChange(question.questionId, (optionIndex + 1).toString());
                                    }}
                                    disabled={isSubmitted}
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      accentColor: "#6c63ff",
                                      cursor: "pointer",
                                      marginRight: "10px"
                                    }}
                                  />
                                  <label
                                    htmlFor=""  // Loại bỏ liên kết với checkbox
                                    className={optionClass}
                                    style={{
                                      width: "calc(100% - 30px)",
                                      height: "100%",
                                      display: "inline-block",
                                      verticalAlign: "middle",
                                      cursor: "pointer",
                                      fontWeight: isSelected ? "600" : "normal", // Đậm nếu được chọn
                                      userSelect: "none" // Ngăn việc bôi chọn text
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Ngăn sự kiện lan truyền lên div cha
                                      if (!isSubmitted) {
                                        handleCheckboxChange(question.questionId, (optionIndex + 1).toString());
                                      }
                                    }}
                                  >
                                    <strong style={{ marginRight: "2px" }}>
                                      {option}.
                                    </strong>
                                    {optionValue}{" "}
                                    {isSubmitted && isCorrect && (
                                      <span
                                        className="answer-status"
                                        style={{
                                          fontWeight: "900",
                                          float: "right",
                                          color: "green",
                                        }}
                                      >
                                        (Đúng)
                                      </span>
                                    )}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isSubmitted && question.instruction && (
                        <div className="answer-review" style={{ margin: "15px 0px 20px 0px" }}>
                          <p>
                            <b>Giải thích: </b>
                            {question.instruction}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="submit-btn mt--20" style={{ marginTop: "20px" }}>
                    <button
                      type="button"
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      style={{
                        background: isSubmitted ? "#f44336" : "#4caf50", // Màu đỏ nếu đã nộp bài, màu xanh nếu chưa nộp
                        color: "white",
                        position: "relative",
                        padding: isSubmitting ? "12px 40px" : "12px 20px", // Padding lớn hơn khi đang loading
                        opacity: isSubmitting ? 0.8 : 1 // Mờ hơn khi đang loading
                      }}
                      onClick={
                        isSubmitted ? handleRetry : submitTestAndUpdateProgress
                      }
                      disabled={isSubmitting} // Vô hiệu hóa khi đang gửi bài
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
                          <style>
                            {`
                              @keyframes spin {
                                to { transform: rotate(360deg); }
                              }
                            `}
                          </style>
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
