import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { authTokenLogin, isTokenExpired } from "../../util/fucntion/auth";
interface TestDetails {
  testId: string;
  title: string;
  duration: number;
  totalQuestions: number;
};
interface QuestionPreparation {
  id: number;
  content: string;
  createdAt: Date;
  deletedDate: Date;
  instruction: string;
  isDeleted: boolean;
  level: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  result: string;
  resultCheck: string;
  topic: string;
  type: string;
  updatedAt: string;
  accountId: number;
  courseId: number;
}

const ContentExampleDetail: React.FC = () => {
  // const { testId } = useParams();
  const [testId, setTestId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionPreparation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const courseId = localStorage.getItem("courseId-exam");
  const [timer, setTimer] = useState<string>("00:00");
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const [examDetails, setExamDetails] = useState<TestDetails>({
    testId: "",
    title: "",
    duration: 0,
    totalQuestions: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // let timerInterval: NodeJS.Timeout | undefined;
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing authData:", error);
        return null;
      }
    }
    return null;
  };
  const auth = getAuthData();
  useEffect(() => {
    const storedTestId = localStorage.getItem("examId");
    const storedDuration = localStorage.getItem("duration");
    const storedTotalQuestions = localStorage.getItem("totalQuestions");
    const storedExamTitle = localStorage.getItem("examTitle");

     
    setExamDetails({
      testId: storedTestId || "",
      title: storedExamTitle || "",
      duration: storedDuration ? parseInt(storedDuration, 10) : 0,
      totalQuestions: storedTotalQuestions ? parseInt(storedTotalQuestions, 10) : 0,
    });
    if (storedDuration) {
      setRemainingTime(parseInt(storedDuration, 10)); // Set initial timer value
    }
    fetchQuestions(storedTestId!);
  }, []);
  const handleAnswerChange = (question: QuestionPreparation, answer: string, index?: number, isChecked?: boolean) => {
    setUserAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers];
      const answerIndex = updatedAnswers.findIndex(a => a.questionId === question.id);

      if (answerIndex >= 0) {
        // Nếu câu trả lời đã có trong mảng
        if (isChecked !== undefined) {
          // Nếu là checkbox, lưu index và answer cho mỗi lựa chọn đã chọn
          if (isChecked) {
            const answerIndexCheckbox = updatedAnswers[answerIndex].answers.findIndex((ans: any) => ans.index === index);
            if (answerIndexCheckbox < 0) {

              updatedAnswers[answerIndex].answers.push({ index, answer });
            }
          } else if (isChecked === false) {
            // Nếu checkbox bị bỏ chọn, xóa đối tượng đáp án tương ứng khỏi mảng
            updatedAnswers[answerIndex].answers = updatedAnswers[answerIndex].answers.filter((ans: any) => ans.index !== index);
          }
        } else {
          // Nếu là câu hỏi multiple-choice, fill-in-the-blank, essay
          updatedAnswers[answerIndex].answers = [{ index, answer }];  // Lưu cả index và answer cho câu hỏi multiple-choice
        }
      } else {
        // Nếu câu trả lời chưa có trong mảng, tạo mới
        if (isChecked !== undefined) {
          // Nếu checkbox, tạo mảng đối tượng với index và answer
          updatedAnswers.push({
            questionId: question.id,
            type: question.type,
            answers: isChecked ? [{ index, answer }] : [],
          });
        } else {
          // Nếu là câu hỏi multiple-choice, fill-in-the-blank, essay
          updatedAnswers.push({
            questionId: question.id,
            type: question.type,
            answers: [{ index, answer }], // Lưu cả index và answer cho các câu hỏi khác
          });
        }
      }

      return updatedAnswers;
    });
  };






  useEffect(() => {
    if (remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prevTime => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(timerRef.current!); // Stop the timer when it reaches 0
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current); // Cleanup the interval on unmount
      }
    };
  }, [remainingTime]);



  useEffect(() => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    setTimer(`${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`);
  }, [remainingTime]);


  const fetchQuestions = async (testId: string) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testId}/questions-exam`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async () => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    const resultData = {
      userAnswers: userAnswers.map(answer => ({
        questionId: answer.questionId,
        type: answer.type,
        answer: answer.answers,
      })),
      accountId: auth.id,
      testId: examDetails.testId,
      courseId: courseId
    };
    console.log(resultData);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/user-answers/exam/${examDetails.testId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const data = await response.json();
      console.log(data);
      alert("Đã gửi kết quả thành công!");
    } catch (err: any) {
      alert("Có lỗi xảy ra khi gửi kết quả: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="horizontalMenucontainer">
      <section className="sptb card pt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-8 col-xs-12">
              <div className="row basic-info">
                <div className="col-12 pl-0">
                  <h1 style={{ fontSize: "15px !important" }}>
                    {examDetails.title}
                  </h1>
                  <div className="mb-2">
                    {examDetails.duration}
                  </div>
                </div>
              </div>

              <div className="quiz-content">
                <div className="row">
                  <div className="col-12">
                    <div id="countdown" className="h4 float-right text-danger">
                      {timer}
                    </div>
                  </div>
                </div>
                <ul style={{ listStyle: "none" }} className="ml-0 list-question mb-5">
                  {questions.map((question, index) => (
                    <li key={index} className="question-info mb-5" question-id={question.id}>
                      <div className="question-title mb-3 font-weight-bold">
                        Câu {index + 1}:
                      </div>
                      <div className="question-content">
                        <div className="item-choice-rd desc-question mb-3">
                          <div>
                            <span>{question.content}</span>
                          </div>
                        </div>

                        {/* Check the question type and render accordingly */}
                        {question.type === "multiple-choice" && (
                          <div className="item-choice-rd list-answer">
                            <ul style={{ listStyle: "none" }} className="ml-0">
                              {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, i) => (
                                <li key={i} className="ansewe-info mb-1 p-3">
                                  <label className="d-flex align-items-center mb-0">
                                    <input type="radio" onChange={() => handleAnswerChange(question, option, i)}  // Lưu cả index và answer
                                      style={{ opacity: 1, position: "unset", marginRight: "10px" }}
                                      checked={userAnswers.find(a => a.questionId === question.id)?.answers[0]?.index === i} />
                                    <span className="ml-3">{option}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.type === "fill-in-the-blank" && (
                          <div className="item-choice-rd">
                            <input type="text" placeholder="Điền câu trả lời của bạn ở đây" value={userAnswers.find(a => a.questionId === question.id)?.answers[0]?.answer || ""}
                              onChange={(e) => handleAnswerChange(question, e.target.value)} className="form-control" />
                          </div>
                        )}

                        {question.type === "essay" && (
                          <div className="item-choice-rd">
                            <textarea placeholder="Viết bài luận của bạn ở đây" className="form-control" value={userAnswers.find(a => a.questionId === question.id)?.answers[0]?.answer || ""}
                              onChange={(e) => handleAnswerChange(question, e.target.value)} rows={4}></textarea>
                          </div>
                        )}

                        {question.type === "checkbox" && (
                          <div className="item-choice-rd list-answer">
                            <ul style={{ listStyle: "none" }} className="ml-0">
                              {[question.optionA, question.optionB, question.optionC, question.optionD].map((option, i) => (
                                <li key={i} className="ansewe-info mb-1 p-3">
                                  <label className="d-flex align-items-center mb-0">
                                    <input type="checkbox" onChange={() => handleAnswerChange(question, option, i, !userAnswers.find(a => a.questionId === question.id)?.answers.some((ans: any) => ans.index === i))}  // Gửi cả index và answer khi chọn
                                      style={{ opacity: 1, position: "unset", marginRight: "10px" }}
                                      checked={userAnswers.find(a => a.questionId === question.id)?.answers.some((ans: any) => ans.index === i)} name={`option-${question.id}`} />
                                    <span className="ml-3">{option}</span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}

                </ul>
                <input type="hidden" id="memberCode" value="2413105" />
                <div className="mb-5" id="quiz-check">
                  <div id="error-check-quiz" style={{ listStyle: "none" }}></div>
                  <div className="text-center" id="div-check-quiz">
                    <button type="button" className="btn btn-warning" onClick={handleSubmit} id="btnCheckQuiz">
                      Kiểm tra kết quả
                    </button>
                  </div>
                  <div id="quiz-help" style={{ listStyle: "none" }}>
                    <hr />
                    <p>
                      <span className="w-5">
                        <i className="fa fa-check fa-2x mr-2 text-info"></i>
                      </span>
                      Đáp án đúng của hệ thống
                    </p>
                    <p>
                      <span className="w-5">
                        <i className="fa fa-check-circle fa-2x mr-2 text-info"></i>
                      </span>
                      Trả lời đúng của bạn
                    </p>
                    <p>
                      <span className="w-5">
                        <i className="fa fa-times-circle fa-2x mr-2 text-danger"></i>
                      </span>
                      Trả lời sai của bạn
                    </p>
                  </div>
                  <div
                    id="quiz-result"
                    style={{ listStyle: "none" }}
                    className="ml-5 text-center h4"
                  >
                    <p>
                      Bạn đã trả lời đúng được
                      <span id="totalAnswer"></span> Câu hỏi.
                    </p>
                    <p>
                      Số điểm bạn đạt được: <span id="totalPoint"></span> điểm.
                    </p>
                  </div>

                  <div
                    className="text-center"
                    id="div-check-quiz-again"
                    style={{ listStyle: "none" }}
                  >
                    <a href="#" className="btn btn-outline-primary mr-3">
                      Làm lại
                    </a>
                    <button type="button" className="btn btn-info" id="btnSaveResult">
                      Lưu kết quả
                    </button>
                  </div>
                </div>
                <div
                  className="mb-5 text-center"
                  id="div-start-quiz"
                  style={{ listStyle: "none" }}
                >
                  <p className="font-italic">
                    Click bên dưới để bắt đầu bài trắc nghiệm.
                  </p>
                  <button type="button" className="btn btn-primary" id="btnStartQuiz">
                    Bắt đầu ngay
                  </button>
                </div>
                <input type="hidden" id="duration-quiz" value="0" />
                <input type="hidden" id="product-code" value="11008842" />
                <input type="hidden" id="package-code" value="5" />
                <input
                  type="hidden"
                  id="json-list-question-info"
                  value='[{"Id":147098,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147099,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147100,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147101,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147102,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147103,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147104,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147105,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147106,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147107,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147108,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147109,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147110,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147111,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147112,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147113,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147114,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147115,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147116,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""},{"Id":147117,"Type":2,"HaveTrueAnswer":true,"ListAnswer":""}]'
                />
                <form id="frmCheckQuiz">
                  <div id="divHtmlAntiForgeryToken">
                    <input
                      name="__RequestVerificationToken"
                      type="hidden"
                      value="rBj_RrvqlIWeW4WfG7Qg7Hf0loZVv7mMmw1KeW-EYE9vx2FMtmi9zBZJnM2pobLSJOlSB-JYHT5SFGq0O-qYJl0i1I8hgkRG-FBU8vkNKHCzj-cbXQPRQAlZJaESqaC8lso0shnA8Jje82CX1uUZHg2"
                    />
                  </div>
                </form>
                <form
                  id="frmResultCheck"
                  action="https://khotrithucso.com/quiz/save-result"
                >
                  <input type="hidden" name="QuizCode" value="11008842" />
                  <input type="hidden" name="QuizPackageCode" value="5" />
                  <input
                    type="hidden"
                    name="QuizName"
                    value="Đề kiểm tra môn Đại số lớp 10 Chương 1 Mệnh đề và Tập hợp"
                  />
                  <input
                    type="hidden"
                    name="TotalPoint"
                    value=""
                    id="TotalPointValue"
                  />
                  <input
                    type="hidden"
                    name="TotalPointMember"
                    value=""
                    id="TotalPointMemberValue"
                  />
                  <input
                    type="hidden"
                    name="TotalAnswer"
                    value=""
                    id="TotalAnswerValue"
                  />
                  <input
                    type="hidden"
                    name="TotalQuestion"
                    value=""
                    id="TotalQuestionValue"
                  />
                  <input
                    type="hidden"
                    name="TotalQuestionDone"
                    value=""
                    id="TotalQuestionDoneValue"
                  />
                  <input
                    type="hidden"
                    name="ListQuestionInfo"
                    value=""
                    id="ListQuestionInfoValue"
                  />
                  <div id="divHtmlAntiForgeryTokenSaveResult">
                    <input
                      name="__RequestVerificationToken"
                      type="hidden"
                      value="rBj_RrvqlIWeW4WfG7Qg7Hf0loZVv7mMmw1KeW-EYE9vx2FMtmi9zBZJnM2pobLSJOlSB-JYHT5SFGq0O-qYJl0i1I8hgkRG-FBU8vkNKHCzj-cbXQPRQAlZJaESqaC8lso0shnA8Jje82CX1uUZHg2"
                    />
                  </div>
                </form>
                <div
                  className="modal fade"
                  id="timeupModal"
                  //   tabindex="-1"
                  role="dialog"
                  aria-labelledby="timeupModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header bg-white">
                        <h5 className="modal-title" id="timeupModalLabel">
                          Thông báo
                        </h5>
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p className="text-center">Bạn đã hết thời gian làm bài.</p>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-light"
                          data-dismiss="modal"
                        >
                          Ok
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="modal fade"
                  id="messageModal"
                  //   tabindex="-1"
                  role="dialog"
                  aria-labelledby="messageModalLabel"
                  aria-hidden="true"
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header bg-white">
                        <h5 className="modal-title" id="messageModalLabel">
                          Thông báo
                        </h5>
                        <button
                          type="button"
                          className="close"
                          data-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p className="text-center" id="txtMessageModal"></p>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-light"
                          data-dismiss="modal"
                        >
                          Ok
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default ContentExampleDetail;
