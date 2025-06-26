import React, { useEffect, useState } from "react";
// import "./style.css";
import CourseNav from "./Component/ComponentList/CourseNavBanner";
import CourseList from "./Component/ComponentList/CourseList";
import CourseListRow from "./Component/ComponentList/CourseListRow";
import Combo from "./Component/Combo/Combo";
import {
  GET_COURSES_BY_CATEGORIES,
  // GET_USER_CATEGORY_LEVEL_1,
  // GET_USER_CATEGORY_LEVEL_2,
  // GET_USER_CATEGORY_LEVEL_3,
  GET_USER_COURSE,
} from "../../api/api";
import { CourseList as CourseListUser } from "../../model/CourseList";
// import { CategoryCourse } from "../../model/CategoryCourse";
import { useParams } from "react-router-dom";
import axios from "axios";
import useCozeChat from "../../hooks/useCozeChat";
import { el } from "date-fns/locale";

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

interface CategoryTree extends Category {
  id: number;
  name: string;
  level: number;
  children: CategoryTree[];
}

function Courses() {
  // Initialize Coze Chat
  useCozeChat({
    token: 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe',
    title: 'TMS Tư Vấn'
  });

  const courseCategoryId = localStorage.getItem("iddanhmuckhoahoc");
  const levelDanhMuc = localStorage.getItem("level");

  const [courses, setCourses] = useState<CourseListUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number>();
  const [loading, setLoading] = useState(true);
  const coursesPerPage = 6;
  const [coursesCategoriesTree, setCoursesCategoriesTree] = useState<CategoryTree[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let url = "";

        
        if (courseCategoryId) {
          if (levelDanhMuc === "3") {
            url = GET_COURSES_BY_CATEGORIES(Number(courseCategoryId), null, null);
          } else if (levelDanhMuc === "2") {
            url = GET_COURSES_BY_CATEGORIES(null, Number(courseCategoryId), null);
          } else if (levelDanhMuc === "1") {
            url = GET_COURSES_BY_CATEGORIES(null, null, Number(courseCategoryId));
          }
        }else{
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
      try {
        // Fetch course categories using the tree API
        const response = await axios.get<{ data: CategoryTree[] }>(
          `${process.env.REACT_APP_SERVER_HOST}/api/categories/tree?level=1&type=COURSE`
        );
        if (response.data && response.data.data) {
          setCoursesCategoriesTree(response.data.data);
        }
      } catch (error) {
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

  // Flatten categories tree to get level1, level2, and level3 arrays
  const extractCategoriesByLevel = () => {
    const level1: Category[] = [];
    const level2: Category[] = [];
    const level3: Category[] = [];

    coursesCategoriesTree.forEach(cat1 => {
      level1.push(cat1);
      if (cat1.children && cat1.children.length > 0) {
        cat1.children.forEach(cat2 => {
          level2.push(cat2);
          if (cat2.children && cat2.children.length > 0) {
            cat2.children.forEach(cat3 => {
              level3.push(cat3);
            });
          }
        });
      }
    });

    return { level1, level2, level3 };
  };

  const { level1, level2, level3 } = extractCategoriesByLevel();

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
                  level1CategoriesCourse={level1}
                  level2CategoriesCourse={level2}
                  level3CategoriesCourse={level3}
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
