import React from "react";
import { CourseDescriptionComponent } from "./CourseDescriptionComponent";
import { VideoContent } from "../../../courseConvert/CoursePageConvert";
// import { VideoContent } from "../../CourseVaoHoc";
interface CourseMainComponentProps {
  selectedVideoContent: VideoContent | null;
}

const CourseVideoComponent: React.FC<CourseMainComponentProps> = ({
  selectedVideoContent
}) => {

  return (
    <div className="course-video-component">
      <h1 className="main-title">{selectedVideoContent?.title}</h1>
      <div className="video-container">
        <video controls className="main-video">
          <source src={selectedVideoContent?.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <CourseDescriptionComponent
        documentShort={selectedVideoContent?.documentShort}
        documentUrl={selectedVideoContent?.documentUrl}
        video_id={selectedVideoContent?.id}
      />
    </div>
  );
};
export default CourseVideoComponent;
