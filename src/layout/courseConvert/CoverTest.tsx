import React, { useState } from "react";
import { CourseDataCourse, ProgressCourses, TestQuickConvert } from "./TestQuickConvert";
import { Test_Lesson } from "./CoursePageConvert";
import { set } from "firebase/database";
import { start } from "repl";

interface TestQuickConvertProps {
    isSidebarOpen: boolean;
    handleToggleSidebar: () => void;
    content: Test_Lesson;
    progressCheck: ProgressCourses[];
    courseData?: CourseDataCourse[];
    setStartTest: (value: boolean) => void;
    isStarted: boolean;
    selectedTestContent?: Test_Lesson;
}
export const CoverTest: React.FC<TestQuickConvertProps> = ({
    isSidebarOpen,
    handleToggleSidebar,
    content,
    progressCheck,
    courseData,
    setStartTest,
    isStarted,
    selectedTestContent

}) => {

    const testID = selectedTestContent?.test_id.toString();
    localStorage.setItem("testIDSTORE", testID!);
   
    const handleStart = () => {
        setStartTest(true);
    };

    return (<div style={{ padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "8px", width: "100%" }}>
        {isStarted ? (
            <TestQuickConvert
                isSidebarOpen={isSidebarOpen}
                handleToggleSidebar={handleToggleSidebar}
                content={content}
                progressCheck={progressCheck}
                courseData={courseData}
            />
        ) : (
            <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Tên Bài: Kiểm Tra Kiến Thức</h2>
                <p style={{ fontSize: "16px", marginBottom: "5px" }}>Số Lượng Câu Hỏi: 20</p>
                <p style={{ fontSize: "16px", marginBottom: "5px" }}>Thời Gian Làm Bài: 30 phút</p>
                <button
                    style={{ padding: "10px 20px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
                    onClick={handleStart}
                >
                    Bắt Đầu Làm Bài
                </button>
            </div>
        )}
    </div>);
}
export default CoverTest;