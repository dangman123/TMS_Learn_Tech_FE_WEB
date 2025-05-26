import React, { useEffect, useState } from "react";
import "./CoursePageConvert.css";
import { Col } from "react-bootstrap";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "../util/encryption";
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

interface TestResponse {
  status: number;
  message: string;
  data: {
    testId: number;
    testTitle: string;
    lessonTitle: string;
    description: string | null;
    totalQuestion: number;
    type: string;
    duration: number;
    format: string;
    isChapterTest: boolean;
    courseId: number;
    lessonId: number;
    questionList: Question[];
  };
}

export const TestQuickConvert: React.FC<TestQuickConvertProps> = ({
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

  // Thay đổi từ object sang string để chỉ chọn một loại tại một thời điểm
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>("all");

  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const [correctAnswersShow, setCorrectAnswersShow] = useState<CorrectAnswer[]>(
    []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultPayload, setResultPayload] = useState<ResponsiveDTO>();
  const testPayload = JSON.parse(localStorage.getItem("testPayload") || "{}");
  const [check, setCheck] = useState(testPayload || null);
  const [hasCompared, setHasCompared] = useState(false);
  const [testContent, setTestContent] = useState<Test_Lesson | null>(null);
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
          `${process.env.REACT_APP_SERVER_HOST}/api/questions/test-mobile/16`,
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
          
          // Update test content
          setTestContent({
            test_id: responseData.data.testId,
            type: "test",
            title: responseData.data.testTitle,
          });
        } else {
          throw new Error(`API returned error: ${responseData.message}`);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData(content.test_id);
    fetchQuestions();
  }, [content.test_id]);

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

  useEffect(() => {
    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: content.test_id,
      questionId: Number(questionId),
      result: answers[Number(questionId)],
    }));
    fetchCorrectAnswers();
    setUserAnswerTest(userAnswers);
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
      chapterTest: false,
      userAnswers: userAnswers,
    };
    // console.log(payload);

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
          `Bài kiểm tra được gửi thành công! \nĐiểm của bạn: ${data.score}`
        );
      } else if (response.status === 201) {
        const data = await response.json(); // Chuyển đổi phản hồi thành JSON
        toast.warn(`Không đạt! \nĐiểm của bạn: ${data.score}`);
      } else if (response.status === 202) {
        const data = await response.json();
        toast.warn(`Hoàn thành khóa học! \n Điểm của bạn: ${data.score}`);
      } else if (response.status === 208) {
        const data = await response.json();
        toast.warn(`Bạn đã làm bài test này! \n Điểm của bạn: ${data.score}`);
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

  const navigateToLesson = (
    direction: string,
    chapterId: number,
    lessonId: number,
    courseData: any,
    progressData: any
  ) => {
    let targetLesson;
    // console.log("Hi");
    if (direction === "next") {
      targetLesson = getNextLesson(chapterId, lessonId, courseData);
    } else if (direction === "previous") {
      targetLesson = getPreviousLesson(chapterId, lessonId, courseData);
    }

    if (!targetLesson) {
      showToast("Không có bài học để chuyển.");
      return;
    }
    let isUnlocked;
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

    // handleVideoClick(
    //   targetLesson.video?.video_id.toString(),
    //   targetLesson.lesson_id.toString(),
    //   chapterId.toString()
    // );
    // console.log("Đã video", targetLesson.video?.video_id.toString());
    // console.log("Đã lesson", targetLesson.lesson_id.toString());
    // console.log("Đã chapter", chapterId.toString());
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

      <div className="inner" style={{ padding: " 0px" }}>
        <div
          className="content"
          style={{ padding: "40px 50px", width: "95%", margin: "0 auto" }}
        >
          <div
            style={{ display: "flex", justifyContent: "right", gap: "10px" }}
          >
            <Timer initialTime={300} /> {/* 5 phút */}
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
            {/* <button
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

                if (chapterId && lessonId) {
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
            </button> */}
          </div>
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

      {/* <ToastContainer /> */}
    </div>
  );
};
