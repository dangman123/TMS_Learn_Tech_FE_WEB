import React, { useEffect, useState } from "react";
import "./CoursePageConvert.css";
import { Col } from "react-bootstrap";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { decryptData, encryptData } from "../util/encryption";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import GiftPopup from "./GiftPopup";
import { Test_Chapter, Test_Lesson } from "./CoursePageConvert";
import Timer from "./component/Timer";
import { sendActionActivity } from "../../service/WebSocketActions";

// Custom CSS for better UI
const chapterTestStyles = `
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
    font-size: 16px;
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

  /* Test Cover Styling */
  .test-cover-container {
    display: flex;
    justify-content: center;
    padding: 40px;
  }
  
  .test-cover-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    overflow: hidden;
    width: 100%;
    max-width: 800px;
  }
  
  .test-cover-header {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }
  
  .test-cover-header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.4;
  }
  
  .test-cover-body {
    padding: 40px;
  }
  
  .test-description {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    line-height: 1.6;
  }
  
  .test-info {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin: 30px 0;
  }
  
  .test-info-item {
    display: flex;
    align-items: center;
    background-color: #f0f7ff;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
  }
  
  .test-info-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
  
  .test-info-icon {
    font-size: 24px;
    margin-right: 15px;
    color: #4e73df;
  }
  
  .test-info-text {
    font-size: 15px;
    font-weight: 500;
    color: #333;
  }
  
  .test-instructions {
    text-align: center;
    font-size: 15px;
    margin: 30px 0;
    color: #555;
    line-height: 1.6;
  }
  
  .test-cover-footer {
    padding: 20px 30px 40px;
    text-align: center;
    border-top: 1px solid #eee;
  }
  
  .start-test-button {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    padding: 16px 40px;
    border-radius: 30px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(78, 115, 223, 0.3);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  
  .start-test-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(78, 115, 223, 0.4);
  }

  @media (max-width: 768px) {
    .lesson-top-bar h5 {
      font-size: 14px;
    }
    
    .rbt-single-quiz h4 {
      font-size: 15px;
    }
    
    .test-cover-header h2 {
      font-size: 20px;
    }
  }
`;

interface TestChapterConvertProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
  content: Test_Chapter;
  progressCheck: Progress[];
  courseData?: CourseData[];
}
interface Progress {
  accountId: number;
  courseId: number;
  chapterId: number;
  lessonId: number;
  videoStatus: boolean;
  testStatus: boolean;
  testScore: number | null;
  chapterTest: boolean;
}
interface Question {
  questionId: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  createdAt: string;
  updatedAt: string;
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
    durationTest: number;
  } | null;
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
  } | null;
}

interface CourseData {
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
export const TestChapterConvert: React.FC<TestChapterConvertProps> = ({
  isSidebarOpen,
  handleToggleSidebar,
  content,
  progressCheck,
  courseData,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const refresh = useRefreshToken();
  const [userAnswerTest, setUserAnswerTest] = useState<
    { testId: number; questionId: number; result: string }[] | null
  >(null);
  const [usedTime, setUsedTime] = useState<number>(0);
  const [testDuration, setTestDuration] = useState<number>(600);
  const [isQuestionsLoaded, setIsQuestionsLoaded] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const [correctAnswersShow, setCorrectAnswersShow] = useState<CorrectAnswer[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultPayload, setResultPayload] = useState<ResponsiveDTO>();
  const testPayload = JSON.parse(localStorage.getItem("testPayload") || "{}");
  const [check, setCheck] = useState(testPayload || null);
  const [hasCompared, setHasCompared] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testContent, setTestContent] = useState<Test_Chapter | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleTimeUpdate = (time: number) => {
    setUsedTime(time);
  };

  const handleStart = () => {
    console.log("handleStart called - starting test");
    setIsStarted(true);
    // Always fetch questions when the button is clicked
    fetchQuestions();
  };

  // Tách hàm fetchQuestions ra khỏi useEffect để có thể gọi riêng khi cần
  const fetchQuestions = async () => {
    console.log("fetchQuestions called - loading questions");
    // Set loading to true when fetching questions
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
      console.log("Fetching questions from API for test ID:", content.test_id);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/test-mobile/${content.test_id}`,
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

      const responseData = await response.json();
      console.log("API Response for questions:", responseData);

      if (responseData.status === 200 && responseData.data) {
        console.log("Setting questions:", responseData.data.questionList.length, "questions loaded");
        setQuestions(responseData.data.questionList);

        // Lấy thời gian làm bài từ API nếu có
        if (responseData.data.duration) {
          setTestDuration(responseData.data.duration);
        }

        // Update test content
        setTestContent({
          test_id: responseData.data.testId,
          type: "test_chapter" as "test_chapter",
          title: responseData.data.testTitle,
        });

        // Đánh dấu đã load câu hỏi
        setIsQuestionsLoaded(true);
        console.log("Questions loaded successfully");
      } else {
        throw new Error(`API returned error: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Lỗi khi tải câu hỏi. Vui lòng thử lại.");
    } finally {
      // Set loading to false after fetching questions
      console.log("Setting loading to false after fetching questions");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (content.test_id) {
      console.log("TestChapterConvert: Initial load for test ID", content.test_id);
      // Set loading to true at the beginning
      setLoading(true);

      // Always fetch test metadata
      fetchTestChapterData(content.test_id);

      // Always show the start button, regardless of whether the test has been started before
      console.log("TestChapterConvert: Content received:", content);
    }
  }, [content.test_id]);

  const handleSubmit = () => {
    console.log("Submitted Answers:", answers);
  };
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const fetchTestChapterData = async (testChapterId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testChapterId}`,
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
      console.log("Test chapter data:", testData);

      // Cập nhật thời gian làm bài từ API
      if (testData.duration) {
        // API trả về giây, chuyển sang phút để hiển thị
        console.log("Thời gian từ API test data (giây):", testData.duration);
        const durationInMinutes = Math.round(testData.duration / 60);
        console.log("Chuyển đổi sang phút:", durationInMinutes);
        setTestDuration(durationInMinutes);
      }

      setTestContent({
        test_id: testData.id,
        type: "test_chapter" as "test_chapter",
        title: testData.title,
        description: testData.description || "",
        totalQuestion: testData.totalQuestion || 0,
        duration: testData.duration || 10
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
    } finally {
      // Set loading to false after fetching test data
      setLoading(false);
    }
  };
  // const handleGoBack = () => {
  //   localStorage.removeItem("encryptedVideoId");
  //   localStorage.removeItem("encryptedTestId");
  //   localStorage.removeItem("encryptedCourseId");
  //   localStorage.removeItem("encryptedLessonId");
  //   localStorage.removeItem("encryptedTestChapterId");
  //   localStorage.removeItem("encryptedChapterId");
  //   window.location.href = "/";
  // };
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
  // useEffect(() => {
  //   if (
  //     testPayload &&
  //     testPayload.userAnswers &&
  //     testPayload.userAnswers.length > 0 &&
  //     testPayload.userAnswers[0].testId === content.test_id
  //   ) {
  //     fetchCorrectAnswers().then(() => {
  //       setHasCompared(true);
  //     });
  //   }
  // }, [content.test_id]);
  useEffect(() => {
    // Update userAnswerTest when answers change
    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: content.test_id,
      questionId: Number(questionId),
      result: answers[Number(questionId)],
    }));

    // Don't call fetchCorrectAnswers here - it should only be called when needed
    setUserAnswerTest(userAnswers);
  }, [answers, content.test_id]);
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

    const authData = localStorage.getItem("authData");
    const accountId = authData ? JSON.parse(authData).id : null;
    const data = { "testId": content.test_id, "courseId": testData.course_id, "lessonId": null, "videoId": null, "action": "Làm bài kiểm tra chương" + content.title }
    if (accountId) {
      sendActionActivity(accountId.toString(), "/app/start_exam_chapter", data, "Làm bài kiểm tra chương " + content.title)
    }
    // sendActionActivity(accountId, "/app/start_exam_chapter", data, "Làm bài kiểm tra chương " + content.title)
   


    // Tạo danh sách questionResponsiveList theo định dạng mới
    const questionResponsiveList = Object.keys(answers).map((questionId) => {
      const question = questions.find(q => q.questionId === Number(questionId));
      return {
        questionId: Number(questionId),
        result: answers[Number(questionId)],
        resultCheck: answers[Number(questionId)],
        type: "multiple-choice" // Giả sử tất cả câu hỏi là multiple-choice
      };
    });

    const totalQuestion = questions.length;

    // Tạo payload theo định dạng mới
    const payload = {
      testId: content.test_id,
      totalQuestion: totalQuestion,
      type: "multiple-choice", // Giả sử tất cả câu hỏi là multiple-choice
      durationTest: usedTime, // Thời lượng tối đa của bài test
      courseId: testData.course_id,
      accountId: accountId,
      chapterId: testData.chapter_id,
      isChapterTest: true, // Đây là bài kiểm tra chương
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
          if (responseData.message === "Khóa học đã hoàn thành") {
            console.log("Khóa học đã hoàn thành");
            setIsSubmitting(false);

            // Hiển thị popup hoàn thành khóa học
            showCourseCompletionPopup();

            // Đánh dấu là đã nộp bài
            setIsSubmitted(true);
          } else {
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
          }
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

        // Show result popup with "already taken" message
        showResultPopup(score, isPassed, false, true);
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

  const isAllQuestionsAnswered = questions.length > 0 &&
    questions.every((q) => !!answers[q.questionId]);

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
    chapterId: number
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
        chapterId: chapterId,
        chapterTest: true, // Giả định đây là kiểm tra bài học
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
      toast.error("Lỗi kiểm tra !");
      return false;
    }
  };

  const showAnswer = async () => {
    const storedEncryptedCourseId = localStorage.getItem("encryptedCourseId");
    const storedEncryptedChapterId = localStorage.getItem("encryptedChapterId");

    if (storedEncryptedCourseId && storedEncryptedChapterId) {
      const decryptedCourseId = decryptData(storedEncryptedCourseId);
      const decryptedChapterId = decryptData(storedEncryptedChapterId);
      const user = getUserData();
      if (user && decryptedCourseId && decryptedChapterId) {
        const isPassed = await checkPassFail(
          user,
          decryptedCourseId,
          decryptedChapterId
        );

        if (isPassed) {
          await fetchCorrectAnswersShow();
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
  const handleGoBack = () => {
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedCourseId");
    localStorage.removeItem("encryptedLessonId");
    localStorage.removeItem("encryptedTestChapterId");
    localStorage.removeItem("encryptedChapterId");
    window.location.href = "/";
  };
  const checkAnswer = (questionId: number) => {
    if (!check || !check.userAnswers) return false;
    const userAnswer = check.userAnswers.find(
      (answer: any) => answer.questionId === questionId
    )?.result;
    const correctAnswer = correctAnswers.find(
      (ans) => ans.id === questionId
    )?.correct_check;
    return userAnswer === correctAnswer;
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
    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapter = courseData.chapters[i];
      if (chapter.chapter_id === chapterId) {
        const lessonIndex = chapter.lessons.findIndex(
          (lesson: any) => lesson.lesson_id === lessonId
        );
        return { chapterIndex: i, lessonIndex };
      }
    }
    return null;
  };
  const getNextLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {

    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học tiếp theo trong cùng một chương
    if (lessonIndex < currentChapter.lessons.length - 1) {
      return currentChapter.lessons[lessonIndex + 1];
    }

    // Chuyển sang bài học đầu tiên của chương kế tiếp
    if (chapterIndex < courseData.chapters.length - 1) {
      const nextChapter = courseData.chapters[chapterIndex + 1];
      return nextChapter.lessons[0];
    }

    return null; // Không có bài học tiếp theo
  };
  const getPreviousLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học trước trong cùng một chương
    if (lessonIndex > 0) {
      return currentChapter.lessons[lessonIndex - 1];
    }

    // Chuyển sang bài học cuối cùng của chương trước đó
    if (chapterIndex > 0) {
      const prevChapter = courseData.chapters[chapterIndex - 1];
      return prevChapter.lessons[prevChapter.lessons.length - 1];
    }

    return null; // Không có bài học trước
  };
  const isLessonUnlocked = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const progress = progressCheck.find(
      (p: any) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return progress?.videoStatus === true || progress?.testStatus === true;
  };
  const handleVideoClick = (
    videoId: string,
    lessonId: string,
    chapterId: string
  ) => {
    console.log("handleVideoClick được gọi với:", videoId, lessonId, chapterId);
    const encryptedVideoId = encryptData(videoId);
    localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedTestChapterId");

    const encryptedChapterId = encryptData(chapterId);
    const encryptedLessonId = encryptData(lessonId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);
    localStorage.setItem("encryptedLessonId", encryptedLessonId);

    window.location.reload();
  };

  const navigateToLesson = (
    direction: string,
    chapterId: number,
    lessonId: number,
    courseData: any,
    progressData: any
  ) => {
    let targetLesson;
    console.log("NavigateToLesson trong TestChapter:", direction, chapterId, lessonId);

    if (direction === "next") {
      targetLesson = getNextLesson(chapterId, lessonId, courseData);
    } else if (direction === "previous") {
      targetLesson = getPreviousLesson(chapterId, lessonId, courseData);
    }

    if (!targetLesson) {
      showToast("Không có bài học để chuyển.");
      return;
    }

    console.log("Target lesson found:", targetLesson);

    // Kiểm tra xem targetLesson có video không
    if (!targetLesson.video || !targetLesson.video.video_id) {
      showToast("Không tìm thấy video cho bài học tiếp theo.");
      return;
    }

    let isUnlocked = true; // Mặc định cho phép chuyển đến bài học trước

    if (direction === "next") {
      // Kiểm tra xem đây có phải là bài học đầu tiên của chương đầu tiên
      const isFirstChapter = courseData.chapters.length > 0 &&
        courseData.chapters[0].chapter_id === chapterId;
      const isFirstLesson = isFirstChapter &&
        courseData.chapters[0].lessons.length > 0 &&
        courseData.chapters[0].lessons[0].lesson_id === lessonId;

      // Nếu không phải bài đầu tiên, cần kiểm tra trạng thái mở khóa
      if (!isFirstLesson) {
        isUnlocked = isLessonUnlocked(
          chapterId,
          targetLesson.lesson_id,
          progressData
        );
      }

      if (!isUnlocked) {
        showToast("Bài học này chưa được mở khóa!");
        return;
      }
    }

    try {
      handleVideoClick(
        targetLesson.video.video_id.toString(),
        targetLesson.lesson_id.toString(),
        chapterId.toString()
      );
    } catch (error) {
      console.error("Lỗi khi chuyển bài học:", error);
      showToast("Có lỗi xảy ra khi chuyển bài học!");
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
      .result-popup .view-certificate {
        background-color: #ff9800;
        color: white;
      }
      .result-popup button:hover {
        opacity: 0.9;
        transform: translateY(-2px);
      }
      .certificate-container {
        margin: 15px auto;
        max-width: 100%;
        position: relative;
        text-align: center;
      }
      .certificate-img {
        width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #f44336;
        animation: confetti-fall 5s ease-in-out infinite;
      }
      @keyframes confetti-fall {
        0% { transform: translateY(-100vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(720deg); }
      }
      .completed-course {
        padding: 15px;
        margin: 15px 0;
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        border-radius: 8px;
        color: white;
        font-weight: bold;
        font-size: 18px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
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

    // Kiểm tra tin nhắn hoàn thành khóa học
    const courseCompleted = isPassed && isCompleted;

    if (courseCompleted) {
      title = 'Chúc mừng bạn đã hoàn thành khóa học!';
      message = 'Bạn đã hoàn thành tất cả các bài học và bài kiểm tra trong khóa học này. Chúng tôi xin trao tặng bạn chứng chỉ hoàn thành khóa học!';
    } else if (isRetaken) {
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

    // Tạo HTML cho phần chứng chỉ nếu hoàn thành khóa học
    let certificateHTML = '';
    if (courseCompleted) {
      certificateHTML = `
        <div class="completed-course">
          <div style="font-size: 24px; margin-bottom: 10px;">🎓 KHÓA HỌC HOÀN THÀNH 🎓</div>
          Xin chúc mừng bạn đã hoàn thành khóa học một cách xuất sắc!
        </div>
      `;
    }

    popup.innerHTML = `
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="score">${score.toFixed(1)}%</div>
      <p>Điểm của bạn</p>
      ${statisticsHTML}
      ${certificateHTML}
      <div class="buttons">
        <button class="view-answers">Xem đáp án</button>
        <button class="view-results">Xem kết quả</button>
        ${isPassed
        ? (courseCompleted
          ? '<button class="view-certificate">Xem chứng chỉ</button>'
          : '<button class="next-lesson">Qua bài tiếp theo</button>')
        : '<button class="retry">Làm lại</button>'
      }
      </div>
    `;

    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay);

    // Xử lý sự kiện cho các nút
    const viewAnswersBtn = popup.querySelector('.view-answers');
    const viewResultsBtn = popup.querySelector('.view-results');
    const nextLessonBtn = popup.querySelector('.next-lesson');
    const retryBtn = popup.querySelector('.retry');
    const viewCertificateBtn = popup.querySelector('.view-certificate');

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

    if (viewCertificateBtn) {
      viewCertificateBtn.addEventListener('click', () => {
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
        showCourseCompletionPopup();
      });
    }
  };

  // Set initial states when component mounts
  useEffect(() => {
    console.log("Initial component setup for test ID:", content.test_id);
    // Always show the "Bắt Đầu Làm Bài" button when component mounts
    setIsStarted(false);
    setIsQuestionsLoaded(false);
    setIsSubmitted(false); // Reset submission status
    console.log("Initial isSubmitted state:", false);

    // Make sure loading is false after initial data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Give some time for fetchTestChapterData to complete

    return () => clearTimeout(timer);
  }, [content.test_id]);

  // Theo dõi khi trạng thái isSubmitted thay đổi
  useEffect(() => {
    console.log("isSubmitted changed:", isSubmitted);
  }, [isSubmitted]);

  // Theo dõi khi trạng thái isSubmitting thay đổi
  useEffect(() => {
    console.log("isSubmitting changed:", isSubmitting);
  }, [isSubmitting]);

  const showCourseCompletionPopup = () => {
    // Tạo style cho popup
    const popupStyle = document.createElement('style');
    popupStyle.innerHTML = `
      .completion-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      .completion-popup {
        background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 600px;
        width: 90%;
        position: relative;
        overflow: hidden;
      }
      .completion-popup h2 {
        margin-top: 0;
        color: #2e7d32;
        font-size: 28px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      }
      .completion-popup p {
        font-size: 18px;
        line-height: 1.6;
        color: #555;
        margin-bottom: 25px;
      }
      .certificate-container {
        margin: 20px auto;
        max-width: 100%;
        position: relative;
        text-align: center;
      }
      .certificate-img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
      }
      .certificate-img:hover {
        transform: scale(1.02);
      }
      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: #f44336;
        animation: confetti-fall 5s ease-in-out infinite;
      }
      @keyframes confetti-fall {
        0% { transform: translateY(-100vh) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(720deg); }
      }
      .completed-badge {
        padding: 15px;
        margin: 20px auto;
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        border-radius: 12px;
        color: white;
        font-weight: bold;
        font-size: 18px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        animation: pulse 2s infinite;
        max-width: 400px;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      .completion-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 30px;
        flex-wrap: wrap;
      }
      .completion-button {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .download-certificate {
        background-color: #ff9800;
        color: white;
        box-shadow: 0 4px 6px rgba(255, 152, 0, 0.3);
      }
      .view-course {
        background-color: #2196f3;
        color: white;
        box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);
      }
      .share-achievement {
        background-color: #9c27b0;
        color: white;
        box-shadow: 0 4px 6px rgba(156, 39, 176, 0.3);
      }
      .completion-button:hover {
        opacity: 0.9;
        transform: translateY(-3px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.2);
      }
      .icon {
        margin-right: 8px;
        font-size: 20px;
      }
      .sparkle {
        position: absolute;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #ffeb3b 10%, transparent 70%);
        border-radius: 50%;
        animation: sparkle 2s infinite;
      }
      @keyframes sparkle {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0); opacity: 0; }
      }
      .firework {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        animation: firework 1s ease-out forwards;
      }
      @keyframes firework {
        0% { transform: translate(0, 0); opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
      }
    `;
    document.head.appendChild(popupStyle);

    // Tạo popup element
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'completion-popup-overlay';

    const popup = document.createElement('div');
    popup.className = 'completion-popup';

    // Tạo nội dung HTML cho popup
    popup.innerHTML = `
      <h2>🎓 CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH KHÓA HỌC! 🎓</h2>
      <p>Bạn đã xuất sắc hoàn thành tất cả các bài học và bài kiểm tra. Đây là một thành tựu đáng tự hào!</p>
      
      <div class="completed-badge">
        <div style="font-size: 24px; margin-bottom: 10px;">✅ KHÓA HỌC HOÀN THÀNH ✅</div>
        Chúng tôi xin trao tặng bạn chứng chỉ hoàn thành khóa học!
      </div>
      
      <div class="certificate-container">
        <img src="https://img.freepik.com/premium-vector/certificate-template-with-luxury-elegant-pattern-diploma-border-design-graduation-achievement_153097-692.jpg" class="certificate-img" alt="Chứng chỉ hoàn thành khóa học" />
      </div>
      
      <div class="completion-buttons">
        <button class="completion-button download-certificate">
          <span class="icon">📥</span> Tải chứng chỉ
        </button>
        <button class="completion-button view-course">
          <span class="icon">🏠</span> Trang chủ
        </button>
        <button class="completion-button share-achievement">
          <span class="icon">🔗</span> Chia sẻ thành tựu
        </button>
      </div>
    `;

    popupOverlay.appendChild(popup);
    document.body.appendChild(popupOverlay);

    // Thêm các hiệu ứng động
    // Tạo hiệu ứng confetti
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0', '#ff9800'][Math.floor(Math.random() * 6)];
      confetti.style.animationDelay = `${Math.random() * 5}s`;
      popupOverlay.appendChild(confetti);
    }

    // Thêm hiệu ứng sparkle
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      popup.appendChild(sparkle);
    }

    // Thêm hiệu ứng pháo hoa
    const createFirework = (x: number, y: number, color: string) => {
      const count = 20;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.backgroundColor = color;
        firework.style.top = `${y}px`;
        firework.style.left = `${x}px`;
        firework.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        firework.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        firework.style.animationDelay = `${Math.random() * 0.2}s`;
        popupOverlay.appendChild(firework);
      }
    };

    // Tạo pháo hoa ngẫu nhiên mỗi 2 giây
    const fireworkInterval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const color = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0'][Math.floor(Math.random() * 5)];
      createFirework(x, y, color);
    }, 2000);

    // Xử lý sự kiện cho các nút
    const downloadBtn = popup.querySelector('.download-certificate');
    const viewCourseBtn = popup.querySelector('.view-course');
    const shareBtn = popup.querySelector('.share-achievement');

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const certificateImg = popup.querySelector('.certificate-img') as HTMLImageElement;
        if (certificateImg && certificateImg.src) {
          const link = document.createElement('a');
          link.href = certificateImg.src;
          link.download = 'Chung-chi-hoan-thanh-khoa-hoc.jpg';
          link.target = '_blank';
          link.click();
        }
      });
    }

    if (viewCourseBtn) {
      viewCourseBtn.addEventListener('click', () => {
        clearInterval(fireworkInterval);
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
        window.location.href = '/';
      });
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        // Nếu có API chia sẻ thì dùng ở đây
        if (navigator.share) {
          navigator.share({
            title: 'Đã hoàn thành khóa học!',
            text: 'Tôi vừa hoàn thành khóa học trên TMS Learn Tech. Hãy tham gia cùng tôi!',
            url: window.location.href,
          })
            .catch((error) => console.log('Lỗi khi chia sẻ:', error));
        } else {
          // Fallback khi trình duyệt không hỗ trợ Web Share API
          const dummyInput = document.createElement('input');
          document.body.appendChild(dummyInput);
          dummyInput.value = window.location.href;
          dummyInput.select();
          document.execCommand('copy');
          document.body.removeChild(dummyInput);

          const shareMsg = document.createElement('div');
          shareMsg.textContent = 'Đã sao chép đường dẫn!';
          shareMsg.style.position = 'fixed';
          shareMsg.style.bottom = '20px';
          shareMsg.style.left = '50%';
          shareMsg.style.transform = 'translateX(-50%)';
          shareMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          shareMsg.style.color = 'white';
          shareMsg.style.padding = '10px 20px';
          shareMsg.style.borderRadius = '5px';
          shareMsg.style.zIndex = '10000';
          document.body.appendChild(shareMsg);

          setTimeout(() => {
            document.body.removeChild(shareMsg);
          }, 2000);
        }
      });
    }

    // Đóng popup khi click ra ngoài
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        clearInterval(fireworkInterval);
        document.body.removeChild(popupOverlay);
        document.head.removeChild(popupStyle);
      }
    });

    return { popupOverlay, popupStyle, fireworkInterval };
  };

  // Add custom styles to document head when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = chapterTestStyles;
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
        <div
          className="content"
          style={{ padding: "30px", width: "100%", maxWidth: "1200px", margin: "0 auto" }}
        >
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "80px 0",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
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
          ) : !isStarted ? (
            <div className="test-cover-container">
              <div className="test-cover-card">
                <div className="test-cover-header">
                  <h2>Bài kiểm tra: {testContent?.title}</h2>
                </div>

                <div className="test-cover-body">
                  {testContent?.description && (
                    <div
                      className="test-description"
                      dangerouslySetInnerHTML={{ __html: testContent.description }}
                    />
                  )}

                  <div className="test-info">
                    <div className="test-info-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-question-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                      </svg>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#333", fontSize: "14px", marginBottom: "5px" }}>Số câu hỏi</div>
                        <div style={{ fontSize: "20px", color: "#4e73df", fontWeight: "600" }}>{testContent?.totalQuestion || "N/A"}</div>
                      </div>
                    </div>

                    <div className="test-info-item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-clock" viewBox="0 0 16 16">
                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                      </svg>
                      <div>
                        <div style={{ fontWeight: "bold", color: "#333", fontSize: "14px", marginBottom: "5px" }}>Thời gian</div>
                        <div style={{ fontSize: "20px", color: "#4e73df", fontWeight: "600" }}>{Math.round((testContent?.duration || testDuration) / 60)} phút</div>
                      </div>
                    </div>
                  </div>

                  <p className="test-instructions">
                    Đây là bài kiểm tra cuối chương. Hãy chuẩn bị sẵn sàng và hoàn thành tốt nhất có thể.
                  </p>
                </div>

                <div className="test-cover-footer">
                  <button
                    className="start-test-button"
                    onClick={handleStart}
                  >
                    Bắt Đầu Làm Bài
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                backgroundColor: "white",
                padding: "15px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <div style={{ fontWeight: "600", fontSize: "18px", color: "#344767" }}>
                  {testContent?.title}
                </div>

                {!isSubmitted ? (
                  <Timer initialTime={testContent?.duration || testDuration} onTimeUpdate={handleTimeUpdate} />
                ) : (
                  <div className="completed-test-badge" style={{
                    background: "#4caf50",
                    color: "white",
                    padding: "8px 15px",
                    borderRadius: "50px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    boxShadow: "0 2px 6px rgba(76, 175, 80, 0.3)"
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle" viewBox="0 0 16 16" style={{ marginRight: "5px" }}>
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                    </svg>
                    Đã hoàn thành: {usedTime} phút
                  </div>
                )}
              </div>

              {/* Hiển thị thời gian đã sử dụng chỉ khi đang làm bài */}
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16" style={{ marginRight: "5px", verticalAlign: "text-top" }}>
                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                  </svg>
                  Thời gian đã làm bài: {usedTime} phút
                </div>
              )} */}

              <div style={{ clear: "both" }}></div>

              <div
                className="rbt-dashboard-table table-responsive mt--30"
                style={{ marginTop: "20px" }}
              >
                <form id="quiz-form" className="quiz-form-wrapper">
                  {questions.map((question, index) => (
                    <div
                      key={question.questionId}
                      className="rbt-single-quiz"
                    >
                      <h4>
                        Câu {index + 1}: {question.content}
                      </h4>
                      <div className="row g-3">
                        {["A", "B", "C", "D"].map((option) => {
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
                              <div className="rbt-form-check">
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
                                  className={optionClass}
                                  style={{ width: "100%", height: "100%" }}
                                >
                                  <strong style={{ marginRight: "8px" }}>
                                    {option}.
                                  </strong>
                                  {optionValue}{" "}
                                  {isSubmitted && (
                                    <span
                                      className="answer-status"
                                      style={{
                                        fontWeight: "600",
                                        float: "right",
                                        color: isAnswerCorrect ? "#4caf50" : "#f44336",
                                        padding: "2px 8px",
                                        borderRadius: "4px",
                                        backgroundColor: isAnswerCorrect ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)"
                                      }}
                                    >
                                      {isAnswerCorrect ? "Đúng" : "Sai"}
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
      <GiftPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};
