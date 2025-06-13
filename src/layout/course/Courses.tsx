import React, { useEffect, useState } from "react";
// import "./style.css";
import CourseNav from "./Component/ComponentList/CourseNavBanner";
import CourseList from "./Component/ComponentList/CourseList";
import CourseListRow from "./Component/ComponentList/CourseListRow";
import Combo from "./Component/Combo/Combo";
import {
  GET_COURSES_BY_CATEGORIES,
  GET_USER_CATEGORY_LEVEL_1,
  GET_USER_CATEGORY_LEVEL_2,
  GET_USER_CATEGORY_LEVEL_3,
  GET_USER_COURSE,
} from "../../api/api";
import { CourseList as CourseListUser } from "../../model/CourseList";
// import { CategoryCourse } from "../../model/CategoryCourse";
import { useParams } from "react-router-dom";
import axios from "axios";
import useCozeChat from "../../hooks/useCozeChat";

interface ApiResponse {
  content: CourseListUser[];
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  level: number;
  parentId: number | null;
  type: string;
}

function Courses() {
  // Initialize Coze Chat
  useCozeChat({
    token: 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe',
    title: 'TMS Tư Vấn'
  });

  const courseCategoryId = localStorage.getItem("iddanhmuckhoahoc");
  const [courses, setCourses] = useState<CourseListUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number>();
  const [loading, setLoading] = useState(true);
  const coursesPerPage = 6;

  const [level1CategoriesCourse, setLevel1CategoriesCourse] = useState<
    Category[]
  >([]);
  const [level2CategoriesCourse, setLevel2CategoriesCourse] = useState<
    Category[]
  >([]);
  const [level3CategoriesCourse, setLevel3CategoriesCourse] = useState<
    Category[]
  >([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url: string;

        if (courseCategoryId) {
          // Nếu có courseCategoryId trong URL, gọi API lấy khóa học theo danh mục
          url = GET_COURSES_BY_CATEGORIES(Number(courseCategoryId));
        } else {
          // Nếu không có danh mục được chọn, gọi API không có phân loại
          url = GET_USER_COURSE(currentPage, coursesPerPage);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const responseData = await response.json();
        console.log("API Response:", responseData); // Log để debug

        // Trích xuất dữ liệu theo đúng cấu trúc API
        let coursesData: CourseListUser[] = [];
        let totalPagesCount = 0;

        if (courseCategoryId) {
          // Cấu trúc API cho GET_COURSES_BY_CATEGORIES
          if (responseData.status === 200 && responseData.data) {
            coursesData = responseData.data.content || [];
            totalPagesCount = responseData.data.totalPages || 0;
          }
        } else {
          // Cấu trúc API cho GET_USER_COURSE
          if (responseData.status === 200 && responseData.data) {
            coursesData = responseData.data.content || [];
            totalPagesCount = responseData.data.totalPages || 0;
          }
        }

        setCourses(coursesData);
        setTotalPages(totalPagesCount);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
        setLoading(false);
      }
    };
    fetchCourses();
  }, [courseCategoryId, selectedCategories, currentPage]); // Chạy lại khi courseCategoryId, selectedCategories hoặc currentPage thay đổi

  useEffect(() => {
    const fetchCourseCategories = async () => {
      // startLoading();
      try {
        const level1Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_1
        );
        const level1Filtered = level1Response.data.filter(
          (category) => category.type === "COURSE"
        );
        setLevel1CategoriesCourse(level1Filtered);

        const level2Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_2
        );
        const level2Filtered = level2Response.data.filter(
          (category) => category.type === "COURSE"
        );
        setLevel2CategoriesCourse(level2Filtered);

        const level3Response = await axios.get<Category[]>(
          GET_USER_CATEGORY_LEVEL_3
        );
        const level3Filtered = level3Response.data.filter(
          (category) => category.type === "COURSE"
        );
        setLevel3CategoriesCourse(level3Filtered);

        // stopLoading();
      } catch (error) {
        // stopLoading();
        console.error("Error fetching categories:", error);
      }
    };
    fetchCourseCategories();
  }, []);

  const filteredCourses = courses && courses.length > 0
    ? courses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section
      className="courses-area pb-120"
      style={{ backgroundColor: "rgb(243 244 246)" }}
    >
      <div className="container" style={{ marginTop: "0px", padding: "0px" }}>


        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="row">
              <div className="col-md-12">
                <CourseNav
                  level1CategoriesCourse={level1CategoriesCourse}
                  level2CategoriesCourse={level2CategoriesCourse}
                  level3CategoriesCourse={level3CategoriesCourse}
                  categories={categories}
                  onSearchChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Course Combo Section */}
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="row">
              <div className="col-md-12">
                <Combo />
              </div>
            </div>
          </div>

          {/* Featured Courses Section */}
          <div className="row mb-5">
            <div className="col-12">
              <CourseListRow title="Khóa Học Nổi Bật" type="popular" />
            </div>
          </div>

          {/* Discounted Courses Section */}
          <div className="row mb-5">
            <div className="col-12">
              <CourseListRow title="Khóa Học Giảm Giá" type="discount" />
            </div>
          </div>
          <div className="col-lg-12 col-md-12 col-sm-12">
            <CourseList courses={filteredCourses} />
            <div className="pegi justify-content-center mt-60">
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage - 1)}
                className={`border-none ${currentPage === 0 ? "disabled" : ""}`}
                aria-disabled={currentPage === 0}
              >
                <i className="fa-regular fa-arrow-left primary-color transition"></i>
              </a>
              {[...Array(totalPages)].map((_, index) => (
                <a
                  key={index}
                  href="#0"
                  onClick={() => handlePageChange(index)}
                  className={index === currentPage ? "active" : ""}
                >
                  {index + 1}
                </a>
              ))}
              <a
                href="#0"
                onClick={() => handlePageChange(currentPage + 1)}
                className={`border-none ${currentPage === totalPages - 1 ? "disabled" : ""
                  }`}
                aria-disabled={currentPage === totalPages - 1}
              >
                <i className="fa-regular fa-arrow-right primary-color transition"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Courses;
