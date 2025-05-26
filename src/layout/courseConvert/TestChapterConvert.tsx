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
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const [correctAnswersShow, setCorrectAnswersShow] = useState<CorrectAnswer[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultPayload, setResultPayload] = useState<ResponsiveDTO>();
  const testPayload = JSON.parse(localStorage.getItem("testPayload") || "{}");
  const [check, setCheck] = useState(testPayload || null);
  const [hasCompared, setHasCompared] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testContent, setTestContent] = useState<Test_Lesson | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  useEffect(() => {
    const fetchQuestions = async () => {
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
          `${process.env.REACT_APP_SERVER_HOST}/api/tests/${content.test_id}/questions`,
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

        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
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
      setTestContent({
        test_id: testData.id,
        type: "test",
        title: testData.title,
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };
  useEffect(() => {
    const fetchQuestions = async () => {
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
          `${process.env.REACT_APP_SERVER_HOST}/api/tests/${content.test_id}/questions`,
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

        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestChapterData(content.test_id);
    fetchQuestions();
  }, [content.test_id]);
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
    // console.log(answers);

    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: content.test_id,
      questionId: Number(questionId),
      result: answers[Number(questionId)],
    }));
    fetchCorrectAnswers();
    setUserAnswerTest(userAnswers);
    // .then(() => {
    //   setHasCompared(true);
    // });
    console.log(userAnswerTest);
    console.log(correctAnswers);
  }, [answers]);
  const submitTestAndUpdateProgress = async () => {
    if (!isAllQuestionsAnswered) {
      toast.error("Vui lòng hoàn thành các câu hỏi !");
      return;
    }

    const testData = await fetchTestDetails(content.test_id);

    if (!testData) {
      console.error("Failed to get test data.");
      return;
    }

    submitTest();
    const authData = localStorage.getItem("authData");
    const accountId = authData ? JSON.parse(authData).id : null;

    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: content.test_id,
      questionId: Number(questionId),
      result: answers[Number(questionId)],
    }));
    const totalQuestion = questions.length;

    const payload = {
      accountId: accountId,
      courseId: testData.course_id,
      totalQuestion: totalQuestion,
      chapterId: testData.chapter_id,
      lessonId: testData.lesson_id,
      videoStatus: true,
      testStatus: true,
      testScore: 0.0,
      chapterTest: true,
      userAnswers: userAnswers,
    };
    console.log(payload);

    localStorage.setItem("testPayload", JSON.stringify(payload));
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
        `${process.env.REACT_APP_SERVER_HOST}/api/user-answers/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 200) {
        const data = await response.json(); // Chuyển đổi phản hồi thành JSON
        toast.success(
          `Bài kiểm tra đã được gửi thành công! \nĐiểm của bạn: ${data.score}`
        );
      } else if (response.status === 201) {
        const data = await response.json(); // Chuyển đổi phản hồi thành JSON
        toast.warn(`Không đạt! \nĐiểm của bạn: ${data.score}`);
      } else if (response.status === 202) {
        const data = await response.json();
        toast.warn(`Hoàn thành khóa học! \n Điểm của bạn: ${data.score}`);
        setIsPopupOpen(true);
      } else if (response.status === 208) {
        const data = await response.json();
        toast.warn(`Bạn đã làm bài test này! \n Điểm của bạn: ${data.score}`);
        // console.log(data);
      } else {
        toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
      }
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
    }
  };

  const isAllQuestionsAnswered =
    questions.length > 0 && questions.every((q) => answers[q.questionId]);

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
          fetchCorrectAnswersShow();
          setIsSubmitted(true);
        } else {
          // console.log("fff");
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
    return null; // Không tìm thấy
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
  return (
    <div
      className="rbt-lesson-rightsidebar overflow-hidden"
      style={{ width: isSidebarOpen ? "75%" : "100%", flex: "1" }}
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
      <div className="inner" style={{ padding: " 0px" }}>
        <div
          className="content"
          style={{ padding: "40px 50px", width: "95%", margin: "0 auto" }}
        >
          <div style={{ display: "flex", justifyContent: "right", gap: "10px" }}>
            <button
              type="button"
              className="rbt-btn btn-gradient hover-icon-reverse"
              style={{
                background: "#4caf50",
                color: "white",
              }}
              onClick={showAnswer}
            >
              Hiển thị đáp án
            </button>

            <button
              type="button"
              className="rbt-btn btn-gradient hover-icon-reverse"
              style={{
                background: "#4caf50",
                color: "white",
              }}
              onClick={(e) => {
                // Lấy dữ liệu từ localStorage
                const storedChapterId =
                  localStorage.getItem("encryptedChapterId");
                const storedLessonId =
                  localStorage.getItem("encryptedLessonId");

                // Giải mã và chuyển sang số
                const chapterId = storedChapterId
                  ? parseInt(decryptData(storedChapterId), 10)
                  : null;
                const lessonId = storedLessonId
                  ? parseInt(decryptData(storedLessonId), 10)
                  : null;

                if (chapterId && lessonId && courseData) {
                  // Gọi hàm chuyển bài học
                  navigateToLesson(
                    "next",
                    chapterId,
                    lessonId,
                    courseData,
                    progressCheck
                  );
                } else {
                  showToast("Không tìm thấy thông tin bài học hiện tại.");
                }
              }}
            >
              Qua bài mới
            </button>
          </div>
          <hr />
          <div
            className="rbt-dashboard-table table-responsive mobile-table-750 mt--30 overflow-hidden"
            style={{ marginTop: "30px" }}
          >
            <form id="quiz-form" className="quiz-form-wrapper">
              {questions.map((question, index) => (
                <div
                  key={question.questionId}
                  className="rbt-single-quiz"
                  style={{ marginTop: "10px" }}
                >
                  <h4 style={{ fontSize: "20px", marginBottom: "10px" }}>
                    Câu {index + 1}: {question.content}
                  </h4>
                  <div className="row g-3">
                    {["A", "B", "C", "D"].map((option) => {
                      const isCorrect = checkAnswer(question.questionId);
                      const isSelected =
                        answers[question.questionId] === option;
                      const isSelectedCheck =
                        userAnswerTest?.find(
                          (pickme) => pickme.questionId == question.questionId
                        )?.result == option;
                      const isAnswerCorrect =
                        correctAnswers.find(
                          (correct) => correct.id === question.questionId
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
                              {question[`option${option}` as keyof Question]}{" "}
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
                    {isSubmitted &&
                      correctAnswers.map(
                        (correctAnswer) =>
                          correctAnswer.id === question.questionId && (
                            <div
                              key={correctAnswer.id}
                              className="answer-review"
                              style={{ margin: "15px 0px 20px 0px" }}
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

              <div className="submit-btn mt--20" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="rbt-btn btn-gradient hover-icon-reverse"
                  style={{
                    background: isSubmitted ? "#f44336" : "#4caf50", // Màu đỏ nếu đã nộp bài, màu xanh nếu chưa nộp
                    color: "white",
                  }}
                  onClick={
                    isSubmitted ? handleRetry : submitTestAndUpdateProgress
                  }
                >
                  {isSubmitted ? "Làm bài lại" : "Nộp bài"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <GiftPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
      {/* <ToastContainer /> */}
    </div>
  );
};
