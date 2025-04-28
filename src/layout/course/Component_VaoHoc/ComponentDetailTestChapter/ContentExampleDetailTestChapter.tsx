import React, { useEffect, useState } from "react";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { decryptData } from "../../../util/encryption";
interface ContentExampleDetailTestProps {
  testId: number;
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
const ContentExampleDetailTestChapter: React.FC<
  ContentExampleDetailTestProps
> = ({ testId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const refresh = useRefreshToken();
  const [correctAnswers, setCorrectAnswers] = useState<CorrectAnswer[]>([]);
  const testPayload = JSON.parse(localStorage.getItem("testPayload") || "{}");
  const [check, setCheck] = useState(testPayload || null);
  const [hasCompared, setHasCompared] = useState(false);
  const [correctAnswersShow, setCorrectAnswersShow] = useState<CorrectAnswer[]>(
    []
  );
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
          `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testId}/questions`,
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
  }, [testId]);

  useEffect(() => {
    if (
      testPayload &&
      testPayload.userAnswers &&
      testPayload.userAnswers.length > 0 &&
      testPayload.userAnswers[0].testId === testId
    ) {
      fetchCorrectAnswers().then(() => {
        setHasCompared(true);
      });
    }
  }, [testId]);

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
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/responsive-test/${testId}`,
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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testId}`,
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

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const submitTestAndUpdateProgress = async () => {
    if (!isAllQuestionsAnswered) {
      toast.error("Vui lòng hoàn thành các câu hỏi !");
      return;
    }

    const testData = await fetchTestDetails(testId);

    if (!testData) {
      console.error("Failed to get test data.");
      return;
    }
    const authData = localStorage.getItem("authData");
    const accountId = authData ? JSON.parse(authData).id : null;

    const userAnswers = Object.keys(answers).map((questionId) => ({
      testId: testId,
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
      videoStatus: false,
      testStatus: false,
      testScore: 0.0,
      chapterTest: true,
      userAnswers: userAnswers,
    };

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
        const data = await response.json();
        toast.success(
          `Bài kiểm tra đã được gửi thành công! Điểm của bạn: ${data.score}`
        );
      } else if (response.status === 201) {
        const data = await response.json();
        toast.warn(
          `Bài kiểm tra đã được gửi, nhưng không đủ điểm để mở khóa bài tiếp theo. Điểm của bạn: ${data.score}`
        );
      } else if (response.status === 202) {
        const data = await response.json();
        toast.warn(`Hoàn thành khóa học ! Điểm của bạn: ${data.score}`);
      } else if (response.status === 208) {
        const data = await response.json();
        toast.warn(`Bạn đã làm bài test này ! Điểm của bạn: ${data.score}`);
      } else {
        // Xử lý lỗi nếu mã trạng thái không phải là 200 hoặc 201
        toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
      }
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      // console.error("Error submitting test answers:", error);
      toast.error("Đã xảy ra lỗi khi gửi bài kiểm tra. Vui lòng thử lại.");
    }
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

  const isAllQuestionsAnswered =
    questions.length > 0 && questions.every((q) => answers[q.questionId]);

  useEffect(() => {
    if (hasCompared) {
      localStorage.removeItem("testPayload");
      setHasCompared(false);
    }
  }, [hasCompared]);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

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
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/responsive-test/${testId}`,
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
      toast.error("Lỗi lấy kết quả !");
      // console.error("Error fetching correct answers:", error);
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
      if (testId && user && decryptedCourseId && decryptedChapterId) {
        const isPassed = await checkPassFail(
          user,
          decryptedCourseId,
          decryptedChapterId
        );

        if (isPassed) {
          fetchCorrectAnswersShow(); // Gọi hàm để hiển thị đáp án
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

  return (
    <div className="col-md-8 col-xs-12">
      <div className="quiz-content">
        <div className="row">
          <div className="col-12">
            <div id="countdown" className="h4 float-right text-danger"></div>
          </div>
        </div>
        {loading ? (
          <p>Loading questions...</p>
        ) : (
          <ul style={{ listStyle: "none" }} className="ml-0 list-question mb-5">
            {questions.map((question, index) => (
              <li key={question.questionId} className="question-info mb-5">
                <div className="question-title mb-3 font-weight-bold">
                  Câu {index + 1}:
                </div>
                <div className="question-content">
                  <div className="item-choice-rd desc-question mb-3">
                    <div>
                      <span>{question.content}</span>
                    </div>
                  </div>
                  <div className="item-choice-rd list-answer">
                    <ul style={{ listStyle: "none" }} className="ml-0">
                      {["A", "B", "C", "D"].map((option, idx) => (
                        <li key={idx} className="answer-info mb-1 p-3">
                          <label className="d-flex align-items-center mb-0">
                            <input
                              type="radio"
                              className="a-value"
                              name={`option-${question.questionId}`}
                              onChange={() =>
                                handleAnswerChange(question.questionId, option)
                              }
                              checked={answers[question.questionId] === option}
                            />
                            <span className="ml-3">
                              <div>
                                {option}.{" "}
                                {question[`option${option}` as keyof Question]}
                              </div>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {correctAnswers.map(
                    (correctAnswer) =>
                      correctAnswer.id === question.questionId && (
                        <div key={correctAnswer.id} className="answer-review">
                          <p>{correctAnswer.instruction}</p>
                          <p>Câu trả lời đúng: {correctAnswer.correct_show}</p>
                          <p>
                            Bạn đã chọn :
                            {checkAnswer(question.questionId)
                              ? " Đúng"
                              : " Sai"}
                          </p>
                        </div>
                      )
                  )}

                  {correctAnswersShow.map(
                    (correctAnswer) =>
                      correctAnswer.id === question.questionId && (
                        <div key={correctAnswer.id} className="answer-review">
                          <p>{correctAnswer.instruction}</p>
                          <p>Câu trả lời đúng: {correctAnswer.correct_show}</p>
                        </div>
                      )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div
          className="mb-5 text-center"
          id="div-start-quiz"
          style={{ listStyle: "none" }}
        >
          <p className="font-italic">
            Click bên dưới để bắt đầu bài trắc nghiệm.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            id="btnStartQuiz"
            onClick={submitTestAndUpdateProgress}
          >
            Bắt đầu ngay
          </button>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={showAnswer}>
            Hiển thị đáp án
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default ContentExampleDetailTestChapter;
