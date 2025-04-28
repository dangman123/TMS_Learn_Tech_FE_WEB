import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
  IconButton,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { authTokenLogin } from "../../../util/fucntion/auth";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
export interface CourseData {
  id: number;
  duration: string;
  title: string;
  enrollment_date: string;
}

interface JwtPayload {
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  isHuitStudent: boolean;
}

interface FilterProps {
  courses: CourseData[]; // Danh sách các khóa học
  onCourseSelect: (courseId: string) => void;
  selectCourseID: string | null;
}

export interface PredictionResult {
  studentId: string; // Mã sinh viên
  accountId: number; // ID tài khoản
  cluster: string; // Cụm học
  clusterDescription: string; // Mô tả cụm
  clusterLabel: string; // Nhãn cụm
  learningPathSuggestion: string[]; // Các gợi ý lộ trình học tập
  prediction: number; // Dự đoán (0 hoặc 1)
  probability: number; // Xác suất dự đoán
  riskLevel: string; // Mức độ rủi ro (Low, Medium, High)
  createdAt: string; // Thời gian tạo dự đoán
}

// type SuggestionCategory = "studyAgain" | "notCompleted" | "lessonsToImprove" | "learningSuggestions" | "notAttempted" | "quizToRetake";

const suggestionDictionary: Record<SuggestionCategory, { keywords: string[]; note: string; message: string }> = {

  //Học lại 
  studyAgain: {
    keywords: ["Nên học lại", "Chưa hoàn thành", "Có bài cần làm lại"],
    note: "Bạn có xu hướng tiếp thu hiệu quả qua hình ảnh – nên ưu tiên các video có sơ đồ, biểu đồ và hình minh họa trực quan.",
    message: "Hãy ôn lại và làm lại bài học để đạt điểm tối thiểu.",
  },

  //Chưa học hoàn thành 
  notCompleted: {
    keywords: ["bạn chưa hoàn thành chương này", "chưa hoàn thành", "Chương chưa bắt đầu học"],
    note: "Hãy tiếp tục học nhé! Hoàn thành chương học này để đạt kết quả tốt nhất.",
    message: "Chương này chưa hoàn thành. Hãy tiếp tục học để đạt kết quả tốt nhất.",
  },

  //điểm chưa cao , có thể cải thiện ( điểm mức khá)
  lessonsToImprove: {
    keywords: ["có thể cải thiện hơn", "điểm chưa cao", "Một số bài có điểm chưa cao, nên ôn thêm"],
    note: "Cần ôn lại các bài học này để nâng cao điểm số.",
    message: "Điểm của bạn chưa cao, cần ôn lại để cải thiện điểm số.",
  },

  // Gợi ý học tập
  learningSuggestions: {
    keywords: ["gợi ý học tập", "phương pháp học", "học hiệu quả"],
    note: "Áp dụng phương pháp học mới để cải thiện hiệu quả.",
    message: "Áp dụng phương pháp học mới để cải thiện hiệu quả học tập.",
  },

  // Các bài học chưa làm
  notAttempted: {
    keywords: ["cần học và làm bài", "bài chưa làm", "chưa học", "Các bài chưa học/chưa làm"],
    note: "Cần học và làm bài để hoàn thành khóa học.",
    message: "Bạn chưa làm bài học này. Hãy bắt đầu ngay để hoàn thành khóa học.",
  },

  // Thông điệp cho Quiz nếu cần làm lại, điểm thấp
  quizToRetake: {
    keywords: ["Có bài cần làm lại", "Làm lại quiz", "Điểm quiz thấp", "cần cải thiện"],
    note: "Ôn tập các bài học trong chương trước khi làm lại quiz để đạt điểm cao hơn.",
    message: "Điểm quiz của bạn thấp. Hãy làm lại quiz sau khi ôn lại bài học trong chương.",
  },
};



const extractDetails = (suggestion: string) => {
  const videoLinkMatch = suggestion.match(/▶️.*?(http:\/\/[^\s]+)/); // Tìm video link
  const testLinkMatch = suggestion.match(/📝.*?(http:\/\/[^\s]+)/); // Tìm test link
  const noteMatch = suggestion.match(/🗒️ Ghi chú: (.*)/); // Tìm ghi chú

  return {
    videoLink: videoLinkMatch ? videoLinkMatch[1] : null,
    testLink: testLinkMatch ? testLinkMatch[1] : null,
    note: noteMatch ? noteMatch[1] : null,
  };
};
type SuggestionCategory =
  | "studyAgain"
  | "notCompleted"
  | "lessonsToImprove"
  | "learningSuggestions"
  | "notAttempted"
  | "quizToRetake";

const getNextThreeValues = (array: any[], startIndex: number) => {
  if (startIndex < 0 || startIndex >= array.length) {
    return []; // Trả về mảng rỗng nếu chỉ mục không hợp lệ
  }
  const nextValues = array.slice(startIndex + 1, startIndex + 4); // Lấy phần tử từ chỉ mục +1 đến chỉ mục +4
  return nextValues;
};
// const categorizeSuggestions = (suggestions: string[]) => {
//   const categorizedSuggestions: {
//     [key in SuggestionCategory]: { item: string; videoLink: string | null; testLink: string | null; note: string | null }[];
//   } = {
//     studyAgain: [],
//     notCompleted: [],
//     lessonsToImprove: [],
//     learningSuggestions: [],
//     notAttempted: [],
//     quizToRetake: [],
//   };

//   suggestions.forEach((suggestion, index) => {
//     let category: SuggestionCategory | null = null;

//     // Xác định danh mục dựa trên từ khóa
//     for (const [key, value] of Object.entries(suggestionDictionary)) {
//       if (value.keywords.some((keyword) => suggestion.includes(keyword))) {
//         category = key as SuggestionCategory;
//         break;
//       }
//     }

//     if (category) {
//       // Lấy các giá trị tiếp theo (video, test, note) dựa trên danh mục
//       const nextValues = getNextThreeValues(suggestions, index);
//       const videoLink = nextValues.find((val) => val.includes("▶️")) || null;
//       const testLink = nextValues.find((val) => val.includes("📝")) || null;
//       const note = nextValues.find((val) => val.includes("🗒️")) || null;

//       // Chỉ lấy các giá trị cần thiết theo danh mục
//       if (category === "notCompleted" || category === "notAttempted") {
//         categorizedSuggestions[category].push({
//           item: suggestion,
//           videoLink: videoLink ? videoLink.match(/http:\/\/[^\s]+/)?.[0] : null,
//           testLink: null, // Không lấy test
//           note: note ? note.replace("🗒️ Ghi chú: ", "").trim() : null,
//         });
//       } else if (category === "lessonsToImprove") {
//         categorizedSuggestions[category].push({
//           item: suggestion,
//           videoLink: videoLink ? videoLink.match(/http:\/\/[^\s]+/)?.[0] : null,
//           testLink: testLink ? testLink.match(/http:\/\/[^\s]+/)?.[0] : null,
//           note: note ? note.replace("🗒️ Ghi chú: ", "").trim() : null,
//         });
//       } else {
//         // Các danh mục khác
//         categorizedSuggestions[category].push({
//           item: suggestion,
//           videoLink: videoLink ? videoLink.match(/http:\/\/[^\s]+/)?.[0] : null,
//           testLink: testLink ? testLink.match(/http:\/\/[^\s]+/)?.[0] : null,
//           note: note ? note.replace("🗒️ Ghi chú: ", "").trim() : null,
//         });
//       }
//     }
//   });

//   return categorizedSuggestions;
// };
const categorizeSuggestions = (suggestions: string[]) => {
  const categorizedSuggestions: {
    [key in SuggestionCategory]: { item: string; videoLink: string | null; testLink: string | null; note: string | null }[];
  } = {
    studyAgain: [],
    notCompleted: [],
    lessonsToImprove: [],
    learningSuggestions: [],
    notAttempted: [],
    quizToRetake: [],
  };

  const chapterSet = new Set<string>(); // Dùng để lưu các chương đã xử lý trong notCompleted

  suggestions.forEach((suggestion, index) => {
    let category: SuggestionCategory | null = null;

    // Xác định danh mục dựa trên từ khóa
    for (const [key, value] of Object.entries(suggestionDictionary)) {
      if (value.keywords.some((keyword) => suggestion.includes(keyword))) {
        category = key as SuggestionCategory;
        break;
      }
    }

    if (category === "notCompleted") {
      let check = suggestion.includes("bạn chưa hoàn thành chương này")
        || suggestion.includes("hãy tiếp tục học nhé")
      if (check) {
        // Nếu chương đã tồn tại và dòng hiện tại là dạng "bạn chưa hoàn thành chương này", bỏ qua
        return; // Bỏ qua dòng này
      } else {
        const nextValues = getNextThreeValues(suggestions, index);
        const videoLink = nextValues
          .map((val) => extractDetails(val).videoLink)
          .find((link) => link !== null) || null;

        const testLink = nextValues
          .map((val) => extractDetails(val).testLink)
          .find((link) => link !== null) || null;

        const note = nextValues
          .map((val) => extractDetails(val).note)
          .find((note) => note !== null) || null;

        categorizedSuggestions["notCompleted"].push({
          item: suggestion,
          videoLink,
          testLink: null, // Không lấy test
          note,
        });
      }



    } else if (category === "lessonsToImprove") {
      if (suggestion.includes("Một số bài có điểm chưa cao")) {
        categorizedSuggestions["lessonsToImprove"].push({
          item: suggestion,
          videoLink: null, // Không lấy video
          testLink: null, // Không lấy test
          note: null, // Không lấy ghi chú
        });
      } else {
        // Thêm vào danh mục lessonsToImprove
        const nextValues = getNextThreeValues(suggestions, index);
        const videoLink = nextValues
          .map((val) => extractDetails(val).videoLink)
          .find((link) => link !== null) || null;

        const testLink = nextValues
          .map((val) => extractDetails(val).testLink)
          .find((link) => link !== null) || null;

        const note = nextValues
          .map((val) => extractDetails(val).note)
          .find((note) => note !== null) || null;

        categorizedSuggestions["lessonsToImprove"].push({
          item: suggestion,
          videoLink,
          testLink,
          note,
        });
      }


    } else if (category === "notAttempted") {
      if (suggestion.includes("Các bài chưa học/chưa làm")) {
        categorizedSuggestions["notAttempted"].push({
          item: suggestion,
          videoLink: null, // Không lấy video
          testLink: null, // Không lấy test
          note: null, // Không lấy ghi chú
        });
      } else {

        const nextValues = getNextThreeValues(suggestions, index);
        const videoLink = nextValues
          .map((val) => extractDetails(val).videoLink)
          .find((link) => link !== null) || null;

        const testLink = nextValues
          .map((val) => extractDetails(val).testLink)
          .find((link) => link !== null) || null;

        const note = nextValues
          .map((val) => extractDetails(val).note)
          .find((note) => note !== null) || null;

        categorizedSuggestions["notAttempted"].push({
          item: suggestion,
          videoLink,
          testLink: null, // Không lấy test
          note,
        });
      }
    } else if (category) {
      // Thêm vào các danh mục khác
      const nextValues = getNextThreeValues(suggestions, index);
      const videoLink = nextValues
        .map((val) => extractDetails(val).videoLink)
        .find((link) => link !== null) || null;

      const testLink = nextValues
        .map((val) => extractDetails(val).testLink)
        .find((link) => link !== null) || null;

      const note = nextValues
        .map((val) => extractDetails(val).note)
        .find((note) => note !== null) || null;

      categorizedSuggestions[category].push({
        item: suggestion,
        videoLink,
        testLink,
        note,
      });
    }
  });

  return categorizedSuggestions;
};

const Filter: React.FC<FilterProps> = ({ courses, onCourseSelect, selectCourseID }) => {
  const [selectedCourse, setSelectedCourse] = useState(selectCourseID || "");
  const [openDialog, setOpenDialog] = useState(false);
  const [studentPrediction, setStudentPrediction] = useState<PredictionResult | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  const [categorizedSuggestions, setCategorizedSuggestions] = useState<any>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        const decodedToken = jwtDecode(authToken) as JwtPayload;
        setHasPermission(decodedToken.isHuitStudent);
      } catch (error) {
        console.error("Token không hợp lệ hoặc không thể giải mã.", error);
        setHasPermission(false);
      }
    } else {
      setHasPermission(false);
    }
  }, []);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);
    onCourseSelect(courseId); // Gọi callback để cập nhật dữ liệu
  };

  // Hiển thị dự đoán kết quả học tập
  const handleButtonClick = async () => {
    if (hasPermission && authData.id) {
      try {
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/prediction-result/student?accountId=${authData.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        setStudentPrediction(data);
        if (data && data.learningPathSuggestion) {
          const categorized = categorizeSuggestions(data.learningPathSuggestion);
          setCategorizedSuggestions(categorized);

          console.log("Categorized Suggestions:", categorized);
        }
        setOpenDialog(true);
      } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        setOpenDialog(true);
      }
    } else {
      alert("Bạn không có quyền dự đoán kết quả học tập.");
    }
  };

  // Dự đoán lại kết quả học tập
  const handleRePredict = async () => {
    if (hasPermission && authData.id) {
      try {
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/prediction-result/student?accountId=${authData.id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        setStudentPrediction(data);
        if (data && data.learningPathSuggestion) {
          const categorized = categorizeSuggestions(data.learningPathSuggestion);
          setCategorizedSuggestions(categorized);

          console.log("Categorized Suggestions:", categorized);
        }
        setOpenDialog(true);
      } catch (error) {
        console.error("Lỗi khi gọi API dự đoán:", error);
        setOpenDialog(true);
      }
    } else {
      alert("Bạn không có quyền dự đoán kết quả học tập.");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Đóng Dialog
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  const toggleExpand = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div style={{ marginBottom: "20px", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <label htmlFor="courseFilter" style={{ fontWeight: 'bold', marginRight: '10px' }}>Lọc khóa học của tôi:</label>
        <select
          id="courseFilter"
          value={selectedCourse}
          onChange={handleSelect}
          style={{ marginLeft: "10px", padding: "8px", borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={!hasPermission}
          style={{ marginTop: "20px", marginRight: "10px" }}
        >
          Dự đoán kết quả học tập
        </Button>

        
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Dự đoán kết quả học tập</DialogTitle>
        <DialogContent>
          {studentPrediction ? (
            <div>
              <Card variant="outlined" style={{ marginBottom: "15px", padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <CardContent>
                  <Typography variant="h6"><strong>Mã sinh viên:</strong> {studentPrediction.studentId}</Typography>
                  <Typography variant="body1"><strong>Cụm học:</strong> {studentPrediction.cluster}</Typography>
                  <Typography variant="body2"><strong>Mô tả cụm:</strong> {studentPrediction.clusterDescription}</Typography>
                  <Typography variant="body2"><strong>Nhãn cụm:</strong> {studentPrediction.clusterLabel}</Typography>
                  <Typography variant="body1"><strong>Dự đoán:</strong> {studentPrediction.prediction === 1 ? "Đạt" : "Không đạt"}</Typography>
                  <Typography variant="body1"><strong>Xác suất:</strong> {studentPrediction.probability * 100}%</Typography>
                  <Typography variant="body1"><strong>Mức độ rủi ro:</strong> {studentPrediction.riskLevel}</Typography>
                  <Typography variant="body1"><strong>Thời gian dự đoán:</strong> {new Date(studentPrediction.createdAt).toLocaleString()}</Typography>
                </CardContent>
              </Card>

              <Button variant="contained" color="secondary" onClick={toggleSuggestions} style={{ marginBottom: '20px' }}>
                {showSuggestions ? 'Ẩn Gợi Ý' : 'Hiển Thị Thêm'}
              </Button>

              {showSuggestions && (
                <div style={{ marginTop: '20px' }}>
                  {Object.keys(categorizedSuggestions).map((category) => {
                    const suggestions = categorizedSuggestions[category];
                    if (suggestions.length > 0) {
                      return (
                        <Card variant="outlined" key={category} style={{ marginBottom: "10px", padding: '10px' }}>
                          <CardContent>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="h6" style={{ flex: 1 }}>
                                {category === "studyAgain" && "Gợi ý học lại"}
                                {category === "notCompleted" && "Chưa hoàn thành"}
                                {category === "lessonsToImprove" && "Bài học cần cải thiện"}
                                {category === "learningSuggestions" && "Gợi ý học tập"}
                                {category === "quizToRetake" && "Quiz cần làm lại"}
                                {category === "notAttempted" && "Các bài cần làm lại"}
                              </Typography>
                              <Button onClick={() => toggleExpand(category)}>
                                {expandedCategory === category ? 'Ẩn' : 'Hiển Thị'}
                              </Button>
                            </div>
                            {expandedCategory === category && (
                              <ul style={{ paddingLeft: '20px' }}>
                                {suggestions.map((suggestion: any, index: any) => (
                                  <li key={index} style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography style={{ flex: 1 }}>{suggestion.item}</Typography>
                                      {suggestion.videoLink && (
                                        <IconButton
                                          component="a"
                                          href={suggestion.videoLink}
                                          target="_blank"
                                          aria-label="Truy cập video"
                                          style={{ color: "blue", margin: "5px", padding: "4px", fontSize: "0.875rem" }}
                                        >
                                          Học ngay <PlayArrowIcon style={{ fontSize: "1rem" }} />
                                        </IconButton>
                                      )}
                                    </div>
                                    {suggestion.testLink && (
                                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                                        <Typography variant="body2" style={{ flex: 1 }}>📝 Làm bài test:</Typography>
                                        <IconButton
                                          component="a"
                                          href={suggestion.testLink}
                                          target="_blank"
                                          aria-label="Truy cập bài test"
                                          style={{ color: "blue", margin: "5px", padding: "4px", fontSize: "0.875rem" }}
                                        >
                                          Làm ngay <PlayArrowIcon style={{ fontSize: "1rem" }} />
                                        </IconButton>
                                      </div>
                                    )}
                                    {suggestion.note && (
                                      <Typography variant="body2" style={{ marginTop: '5px' }}>🗒️ Ghi chú: {suggestion.note}</Typography>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          ) : (
            <Typography variant="body2">Đang tải dữ liệu...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Đóng</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Filter;
