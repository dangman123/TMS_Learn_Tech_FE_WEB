import React, { useState, useEffect } from "react";
import { ProgressCourses, TestQuickConvert, CourseDataCourse } from "./TestQuickConvert";
import { Test_Lesson } from "./CoursePageConvert";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { toast } from "react-toastify";
import { sendActionActivity } from "../../service/WebSocketActions";
import { colors } from "material-ui/styles";

// Custom CSS for better UI
const coverTestStyles = `
  .cover-test-container {
    padding: 0;
    background-color: #f9f9f9;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    width: 100%;
    flex-grow: 1;
  }
  
  .cover-test-card {
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .cover-test-header {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    padding: 30px;
    text-align: center;
    position: relative;
  }
  
  .cover-test-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.5px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.4;
  }

  .cover-test-body {
    padding: 40px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .cover-test-description {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    line-height: 1.6;
    border-left: 4px solid #4e73df;
    font-size: 15px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .test-info-container {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin: 30px 0;
    flex-wrap: wrap;
  }
  
  .test-info-item {
    display: flex;
    align-items: center;
    background-color: #f0f7ff;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: transform 0.3s ease;
    min-width: 180px;
  }
  
  .test-info-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
  
  .test-info-icon {
    font-size: 24px;
    margin-right: 15px;
    color: #4e73df;
    flex-shrink: 0;
  }
  
  .test-info-content {
    display: flex;
    flex-direction: column;
  }
  
  .test-info-label {
    font-weight: bold;
    color: #333;
    font-size: 13px;
    margin-bottom: 5px;
  }
  
  .test-info-value {
    font-size: 18px;
    color: #4e73df;
    font-weight: 600;
  }

  .test-instructions {
    text-align: center;
    font-size: 15px;
    margin: 30px 0;
    color: #555;
    line-height: 1.6;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .test-footer {
    padding: 20px 0 40px;
    text-align: center;
  }
  
  .start-test-button {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    padding: 16px 40px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(78, 115, 223, 0.3);
    letter-spacing: 1px;
  }
  
  .start-test-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(78, 115, 223, 0.4);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    height: 100%;
    width: 100%;
  }
  
  .loading-spinner {
    border: 4px solid rgba(78, 115, 223, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4e73df;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .cover-test-header h2 {
      font-size: 20px;
    }
    
    .test-info-container {
      gap: 20px;
    }
    
    .test-info-item {
      min-width: 100%;
      padding: 12px 20px;
    }
    
    .test-info-value {
      font-size: 16px;
    }
    
    .start-test-button {
      padding: 14px 30px;
      font-size: 15px;
    }
    
    .cover-test-body {
      padding: 30px 20px;
    }
  }
`;

interface TestQuickConvertProps {
    isSidebarOpen: boolean;
    handleToggleSidebar: () => void;
    content: Test_Lesson;
    progressCheck: ProgressCourses[];
    courseData?: CourseDataCourse[];
    setStartTest: (value: boolean) => void;
    isStarted: boolean;
    selectedTestContent?: Test_Lesson;
    shouldFetchQuestions?: boolean;
    setShouldFetchQuestions?: (value: boolean) => void;
}

interface TestDetails {
    id?: number;
    title?: string;
    description?: string;
    totalQuestion?: number;
    duration?: number;
    type?: string;
    format?: string;
    pointRanking?: number | null;
    pointRequired?: number | null;
}

export const CoverTest: React.FC<TestQuickConvertProps> = ({
    isSidebarOpen,
    handleToggleSidebar,
    content,
    progressCheck,
    courseData,
    setStartTest,
    isStarted,
    selectedTestContent,
    shouldFetchQuestions,
    setShouldFetchQuestions
}) => {
    const refresh = useRefreshToken();
    const [testDetails, setTestDetails] = useState<TestDetails>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [showTestQuickConvert, setShowTestQuickConvert] = useState<boolean>(false);
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

    const testID = selectedTestContent?.test_id.toString();

    // Add custom styles to document head when component mounts
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.innerHTML = coverTestStyles;
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Fetch test details when component mounts
    useEffect(() => {
        const fetchTestDetails = async () => {
            if (!testID) return;

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
                    `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testID}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch test details. Status: ${response.status}`);
                }

                const data = await response.json();
                setTestDetails(data);
                localStorage.setItem("testIDSTORE", testID);
            } catch (error) {
                console.error("Error fetching test details:", error);
                toast.error("Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchTestDetails();

        // Check if test was already started
        if (isStarted) {
            setShowTestQuickConvert(true);
        }
    }, [testID, isStarted]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const containerWidth = windowWidth < 992 ? "100%" : (isSidebarOpen ? "75%" : "100%");

    const handleStart = () => {
        setStartTest(true);
        if (setShouldFetchQuestions) {

            const authData = localStorage.getItem("authData");
            const accountId = authData ? JSON.parse(authData).id : null;

            if (accountId) {
                const data = { "testId": content.test_id, "courseId": courseData?.[0].course_id, "lessonId": null, "videoId": null, "action": "Làm bài kiểm tra" + content.title }
                sendActionActivity(accountId.toString(), "/app/start_exam", data, "Làm bài kiểm tra " + content.title)
            }

            setShouldFetchQuestions(true);
        }
        setShowTestQuickConvert(true);
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "30 phút";
        const minutes = Math.floor(seconds / 60);
        return `${minutes} phút`;
    };

    // If test has started, show TestQuickConvert
    if (showTestQuickConvert) {
        return (
            <TestQuickConvert
                isSidebarOpen={isSidebarOpen}
                handleToggleSidebar={handleToggleSidebar}
                content={content}
                progressCheck={progressCheck}
                courseData={courseData}
                shouldFetchQuestions={shouldFetchQuestions}
                setShouldFetchQuestions={setShouldFetchQuestions}
            />
        );
    }

    // Otherwise show the test cover page
    return (
        <div
          className="cover-test-container"
          style={{ width: containerWidth, flex: "1" }}
        >
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: "20px", fontSize: "16px", color: "#555" }}>
                        Đang tải thông tin bài kiểm tra...
                    </p>
                </div>
            ) : (
                <div className="cover-test-card">
                    <div className="cover-test-header">
                        <h2 style={{color:"white"}}>
                            {testDetails.title || selectedTestContent?.title || "Kiểm Tra Kiến Thức"}
                        </h2>
                    </div>

                    <div className="cover-test-body">
                        {testDetails.description && (
                            <div 
                                className="cover-test-description"
                                dangerouslySetInnerHTML={{ __html: testDetails.description }}
                            />
                        )}

                        <div className="test-info-container">
                            <div className="test-info-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-question-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                                </svg>
                                <div className="test-info-content">
                                    <span className="test-info-label">Số câu hỏi</span>
                                    <span className="test-info-value">{testDetails?.totalQuestion || "N/A"}</span>
                                </div>
                            </div>

                            <div className="test-info-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-clock" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                </svg>
                                <div className="test-info-content">
                                    <span className="test-info-label">Thời gian</span>
                                    <span className="test-info-value">{(testDetails?.duration!) / 60} phút</span>
                                </div>
                            </div>

                            {testDetails.pointRanking !== null && (
                              <div className="test-info-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-star" viewBox="0 0 16 16">
                                  <path d="M2.866 14.85c-.079.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.523-3.356c.329-.314.158-.888-.283-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 4.118l-4.898.696c-.441.062-.612.636-.282.95l3.523 3.356-.83 4.73z"/>
                                </svg>
                                <div className="test-info-content">
                                  <span className="test-info-label">Điểm cộng</span>
                                  <span className="test-info-value">{testDetails.pointRanking}</span>
                                </div>
                              </div>
                            )}

                            {testDetails.pointRequired !== null && (
                              <div className="test-info-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="test-info-icon bi bi-check-circle" viewBox="0 0 16 16">
                                  <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.97-8.03a.75.75 0 0 0-1.06-1.06L7.477 9.343 5.09 6.957a.75.75 0 1 0-1.06 1.06l2.887 2.887a.75.75 0 0 0 1.06 0l3.993-3.993Z"/>
                                </svg>
                                <div className="test-info-content">
                                  <span className="test-info-label">Điểm yêu cầu</span>
                                  <span className="test-info-value">{testDetails.pointRequired}</span>
                                </div>
                              </div>
                            )}
                        </div>

                        {testDetails.type && (
                            <div style={{ 
                                textAlign: "center", 
                                margin: "20px 0 30px", 
                                backgroundColor: "#f0f7ff", 
                                padding: "12px 20px",
                                borderRadius: "8px",
                                display: "inline-block",
                                color: "#4e73df",
                                fontWeight: 500
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-list-check" viewBox="0 0 16 16" style={{ verticalAlign: "text-bottom", marginRight: "8px" }}>
                                    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/>
                                </svg>
                                Loại câu hỏi: {testDetails.type}
                            </div>
                        )}

                        <div style={{ textAlign: "center", margin: "30px 0 15px" }}>
                            <p style={{ fontSize: "16px", color: "#555", maxWidth: "600px", margin: "0 auto" }}>
                                Hãy chuẩn bị sẵn sàng để làm bài kiểm tra. Khi bạn đã sẵn sàng, hãy nhấn nút "Bắt đầu làm bài" bên dưới.
                            </p>
                        </div>
                        
                        <div style={{ textAlign: "center",margin:"auto", marginTop: "50px", marginBottom: "30px" }}>
                            <button
                                className="start-test-button"
                                onClick={handleStart}
                            >
                                Bắt Đầu Làm Bài
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoverTest;