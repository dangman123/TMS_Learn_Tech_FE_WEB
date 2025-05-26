import React, { useEffect, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import { CourseReview } from "./Component/ComponetsDetail/CourseReview";
import { CourseContent } from "./Component/ComponetsDetail/CourseContent";
import { CourseSidebar } from "./Component/ComponetsDetail/CourseSidebar";
import {
  GET_USER_COURSE_DETAIL_BY_COURSE_ID,
  GET_USER_COURSE_DETAIL_TOTAL_LESSION,
} from "../../api/api";
import { useParams } from "react-router-dom";
import "./courseDetail.css";
import { CHECK_ACTIVED_ENCROLLED_COURSE } from "../../api/api";
import CourseContentLearningTest from "./Component/ComponetsDetail/CourseContentLearningTest";
import axios from "axios";
import { toast } from "react-toastify";

export interface Video {
  videoId: number; // ID của video
  videoTitle: string; // Tiêu đề video
  videoDuration: number;
  viewTest: boolean;
}

// Interface cho Lesson (Bài học)
export interface Chapter {
  chapterId: number;
  chapterTitle: string;
  lessonCount: number;
  videoDTOUserViewList: Video[];
}

// Interface cho toàn bộ dữ liệu trả về từ API
export interface CourseContent {
  chapters: Chapter[]; // Danh sách các bài học trong khóa học
}

function CourseDetail() {
  // Lấy slug từ URL
  const { slug } = useParams<{ slug: string }>();
  
  // Trích xuất ID từ slug (lấy số cuối cùng sau dấu -)
  const extractCourseId = () => {
    if (!slug) return null;
    
    // Tìm ID ở cuối URL, sau dấu gạch ngang cuối cùng
    const match = slug.match(/[-](\d+)$/);
    if (match && match[1]) {
      return match[1];
    }
    
    // Nếu không tìm thấy cách trên, thử kiểm tra xem toàn bộ slug có phải là số
    if (/^\d+$/.test(slug)) {
      return slug;
    }
    
    console.error("Không thể trích xuất ID khóa học từ URL:", slug);
    return null;
  };
  
  const id = extractCourseId();
  
  useEffect(() => {
    if (!id) {
      toast.error("Không tìm thấy thông tin khóa học từ URL");
    }
  }, [id]);
  
  const [course, setCourse] = useState(null);
  const [totalLession, setTotalLession] = useState<{
    total_students: number;
    total_lessons: number;
  }>({
    total_students: 0,
    total_lessons: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const authData = localStorage.getItem("authData");
  const fetchLessons = async (courseId: string): Promise<void> => {
    try {
      const response = await axios.get<Chapter[]>(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/${courseId}/lessons-view`
      );
      setChapters(response.data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    }
  };
  useEffect(() => {
    if (id) {
      fetchLessons(id);
    }
    fetch(GET_USER_COURSE_DETAIL_BY_COURSE_ID(Number(id)))
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData && responseData.data) {
          setCourse(responseData.data);
        } else {
          console.error("Dữ liệu khóa học không đúng định dạng:", responseData);
          setCourse(null);
        }
      })
      .catch((error) => console.error("Error fetching course data:", error));

    fetch(GET_USER_COURSE_DETAIL_TOTAL_LESSION(Number(id)))
      .then((response) => response.json())
      .then((data) => setTotalLession(data))
      .catch((error) => console.error("Error fetching course data:", error));

    fetch(`${process.env.REACT_APP_SERVER_HOST}/api/reviews/course/${Number(id)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.data && data.data.content) {
          setReviews(data.data.content);
        } else {
          setReviews([]);
        }
      })
      .catch((error) => console.error("Error fetching course reviews:", error));
  }, [id]);

  if (!course) {
    return <p>Loading...</p>;
  }

  return (
    <section className="courses-details-area pt-120 pb-120" style={{ backgroundColor: "rgb(243, 244, 246)" }}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8 order-2 order-lg-1" >
            <CourseContent course={course} reviews={reviews} />
            <CourseContentLearningTest chapters={chapters} />
            <CourseReview />
          </div>

          <div className="col-lg-4 order-1 order-lg-2">
            <CourseSidebar course={course} total={totalLession} />
          </div>
        </div>

      </div>
    </section>
  );
}
export default CourseDetail;
