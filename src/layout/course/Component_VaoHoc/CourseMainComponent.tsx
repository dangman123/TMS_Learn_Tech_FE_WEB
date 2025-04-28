import React from "react";
import { CourseDescriptionComponent } from "./ComponentVaoHocMain/CourseDescriptionComponent";
import Example_DetailTest from "./ComponentDetailTest/Example_DetailTest";
import CourseVideoComponent from "./ComponentVaoHocMain/CourseVideoComponent";
import Example_DetailTestChapter from "./ComponentDetailTestChapter/Example_DetailTestChapter";
import { Test_Chapter, Test_Lesson, VideoContent } from "../../courseConvert/CoursePageConvert";
// import { Test_Chapter, Test_Lesson, VideoContent } from "../CourseVaoHoc";

interface CourseMainComponentProps {
  selectedVideoContent: VideoContent | null;
  selectedTestContent: Test_Lesson | null;
  selectedTestChapterContent: Test_Chapter | null;
}

export const CourseMainComponent: React.FC<CourseMainComponentProps> = ({
  selectedVideoContent,
  selectedTestContent,
  selectedTestChapterContent,
}) => {
  // Điều kiện trả về null nếu không có nội dung nào được chọn
  if (!selectedVideoContent && !selectedTestContent && !selectedTestChapterContent) {
    return null;
  }

  // Trả về nội dung tương ứng nếu có video content
  if (selectedVideoContent) {
    return (
      <div className="col-md-7 main-content">
        <CourseVideoComponent selectedVideoContent={selectedVideoContent} />
      </div>
    );
  }

  // Trả về nội dung tương ứng nếu có test content
  if (selectedTestContent) {
    return (
      <div className="col-md-7 main-content">
        <Example_DetailTest
          testId={selectedTestContent.test_id}
          title={selectedTestContent.title}
        />
      </div>
    );
  }

  // Trả về nội dung tương ứng nếu có test chapter content
  if (selectedTestChapterContent) {
    return (
      <div className="col-md-7 main-content">
        <Example_DetailTestChapter
          testId={selectedTestChapterContent.test_id}
          title={selectedTestChapterContent.title}
        />
      </div>
    );
  }

  return null; 
};
