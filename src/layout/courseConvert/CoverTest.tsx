import React, { useState, useEffect } from "react";
import { ProgressCourses, TestQuickConvert } from "./TestQuickConvert";
import { CourseData, Test_Lesson } from "./CoursePageConvert";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { toast } from "react-toastify";

interface TestQuickConvertProps {
    isSidebarOpen: boolean;
    handleToggleSidebar: () => void;
    content: Test_Lesson;
    progressCheck: ProgressCourses[];
    courseData?: CourseData[];
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

    const testID = selectedTestContent?.test_id.toString();

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
    }, [testID]);

    const handleStart = () => {
        setStartTest(true);
        if (setShouldFetchQuestions) {
            setShouldFetchQuestions(true);
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "30 phút";
        const minutes = Math.floor(seconds / 60);
        return `${minutes} phút`;
    };

    return (
        <div style={{ padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "8px", width: "100%" }}>
            {isStarted ? (
                <TestQuickConvert
                    isSidebarOpen={isSidebarOpen}
                    handleToggleSidebar={handleToggleSidebar}
                    content={content}
                    progressCheck={progressCheck}
                    courseData={courseData}
                    shouldFetchQuestions={shouldFetchQuestions}
                    setShouldFetchQuestions={setShouldFetchQuestions}
                />
            ) : (
                <div style={{ textAlign: "center" }}>
                    {loading ? (
                        <div style={{ padding: "20px" }}>
                            <p>Đang tải thông tin bài kiểm tra...</p>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
                                Tên Bài: {testDetails.title || selectedTestContent?.title || "Kiểm Tra Kiến Thức"}
                            </h2>

                            {/* <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                                Số Lượng Câu Hỏi: {testDetails.totalQuestion || "20"}
                            </p>
                            <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                                Thời Gian Làm Bài: {formatDuration(testDetails.duration)}
                            </p> */}
                            <div style={{
                                fontSize: "16px",
                                marginBottom: "30px",
                                display: "flex",
                                justifyContent: "center",
                                gap: "30px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#f0f4f8",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16" style={{ marginRight: "10px", color: "#4caf50" }}>
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                                    </svg>
                                    <div>
                                        <div style={{ fontWeight: "bold", color: "#333" }}>Số câu hỏi</div>
                                        <div style={{ fontSize: "18px", color: "#4caf50" }}>{testDetails?.totalQuestion || "N/A"}</div>
                                    </div>
                                </div>

                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "#f0f4f8",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16" style={{ marginRight: "10px", color: "#2196f3" }}>
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                    </svg>
                                    <div>
                                        <div style={{ fontWeight: "bold", color: "#333" }}>Thời gian</div>
                                        <div style={{ fontSize: "18px", color: "#2196f3" }}>{(testDetails?.duration!) / 60} phút</div>
                                    </div>
                                </div>
                            </div>


                            {testDetails.type && (
                                <p style={{ fontSize: "16px", marginBottom: "15px" }}>
                                    Loại câu hỏi: {testDetails.type}
                                </p>
                            )}
                            <button
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}  
                                onClick={handleStart}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#45a049";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#4CAF50";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                                }}
                            >
                                Bắt Đầu Làm Bài
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default CoverTest;