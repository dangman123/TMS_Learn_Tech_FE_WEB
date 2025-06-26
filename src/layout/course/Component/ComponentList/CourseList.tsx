import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Components
import NavCourse from "./NavCourse";

// Models & Utils
import { CourseList as CourseListUser } from "../../../../model/CourseList";
import { formatCurrency } from "../../../util/formatCurrency";

// Types
type CourseListProps = {
  courses: CourseListUser[];
};

interface Category {
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

// Utilities
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

// Main component
function CourseList({ courses }: CourseListProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [coursesCategoriesTree, setCoursesCategoriesTree] = useState<CategoryTree[]>([]);
  const [level1CategoriesCourse, setLevel1CategoriesCourse] = useState<Category[]>([]);
  const [level2CategoriesCourse, setLevel2CategoriesCourse] = useState<Category[]>([]);
  const [level3CategoriesCourse, setLevel3CategoriesCourse] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<CourseListUser[]>(courses);

  // Effects
  useEffect(() => {
    fetchCourseCategories();
  }, []);

  // Filter courses when search term or courses change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Data fetching
  const fetchCourseCategories = async () => {
    try {
      // Fetch categories using the tree API
      const response = await axios.get<{ data: CategoryTree[] }>(
        `${process.env.REACT_APP_SERVER_HOST}/api/categories/tree?level=1&type=COURSE`
      );

      if (response.data && response.data.data) {
        // setCoursesCategoriesTree(response.data.data);

        // Extract categories by level
        const { level1, level2, level3 } = extractCategoriesByLevel(response.data.data);
        setLevel1CategoriesCourse(level1);
        setLevel2CategoriesCourse(level2);
        setLevel3CategoriesCourse(level3);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  // Helper function to extract categories by level
  const extractCategoriesByLevel = (tree: CategoryTree[]) => {
    const level1: Category[] = [];
    const level2: Category[] = [];
    const level3: Category[] = [];

    tree.forEach(cat1 => {
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

  // Helper methods
  const findCategory = (id: number): Category | undefined => {
    return (
      level1CategoriesCourse.find((category) => category.id === id) ||
      level2CategoriesCourse.find((category) => category.id === id) ||
      level3CategoriesCourse.find((category) => category.id === id)
    );
  };

  const handleCourseClick = (courseId: number, categoryId: number, categoryIdLevel1: number, categoryIdLevel2: number, courseTitle: string) => {
    if (!courseId) {
      console.error("Khóa học không hợp lệ!");
      return;
    }

    const category = findCategory(categoryId);
    if (!category) {
      console.error("Danh mục không hợp lệ!");
      return;
    }

    const courseSlug = removeVietnameseTones(courseTitle);
    localStorage.setItem("tenkhoahoc", courseSlug);

    // Tạo URL bao gồm tên khóa học và ID, đảm bảo có dấu gạch ngang giữa chúng
    window.location.href = `/khoa-hoc/${courseSlug}-${courseId}`;

    // Log để debug
    console.log(`Chuyển hướng đến: /khoa-hoc/${courseSlug}-${courseId}`);
  };

  // Render functions
  const renderEmptyState = () => (
    <div id="listCourseProductCat" className="row">
      <div className="col-12">
        <div
          className="empty-state-container text-center"
          style={{
            width: "100%",
            margin: "60px auto",
            padding: "40px 20px",
            backgroundColor: "#f7f9fc",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            border: "1px solid #e6eef9"
          }}
        >
          <div className="empty-state-icon mb-4">
            <i
              className="fas fa-search"
              style={{
                fontSize: "60px",
                color: "#2eb97e",
                padding: "30px",
                backgroundColor: "rgba(46, 185, 126, 0.1)",
                borderRadius: "50%",
                marginBottom: "15px"
              }}
            ></i>
          </div>

          <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "16px" }}>
            Không tìm thấy khóa học nào
          </h3>

          <p style={{ fontSize: "16px", color: "#666", maxWidth: "400px", margin: "0 auto" }}>
            Hiện không có khóa học nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với bộ lọc khác!
          </p>
        </div>
      </div>
    </div>
  );

  const renderCourseRating = (rating: number) => (
    <div className="star">
      {[...Array(5)].map((_, index) => (
        <i
          key={index}
          className={`fa-sharp fa-solid fa-star ${index < Math.floor(rating) ? "" : "disabled"
            }`}
        ></i>
      ))}
    </div>
  );

  const renderCoursePrice = (course: CourseListUser) => (
    <div
      className="price-container"
      style={{ textAlign: "right", flexShrink: 0 }}
    >
      {course.type === "FREE" ? (
        <span className="price-current">Miễn Phí</span>
      ) : (
        <>
          {course.cost > course.price ? (
            <>
              <div className="d-flex flex-column align-items-end">
                <span
                  className="price-cost"
                  style={{
                    textDecoration: "line-through",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrency(course.cost)}
                </span>
                <span
                  className="price-current"
                  style={{ fontWeight: "bold", whiteSpace: "nowrap" }}
                >
                  {formatCurrency(course.price)}
                </span>
              </div>
            </>
          ) : (
            <span
              className="price-current"
              style={{ fontWeight: "bold", whiteSpace: "nowrap" }}
            >
              {formatCurrency(course.price)}
            </span>
          )}
        </>
      )}
    </div>
  );

  const renderCourseCard = (course: CourseListUser) => {
    if (!course.status) return null;

    return (
      <div key={course.id} className="col-xl-4 col-md-6">
        <div
          className="courses-two__item"
          style={{
            padding: "0px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Course Image */}
          <div className="courses-two__image image" style={{ width: "100%" }}>
            <Link
              style={{ width: "100%" }}
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleCourseClick(course.id!, Number((course as any).courseCategoryId), Number((course as any).courseCategoryIdLevel1), Number((course as any).courseCategoryIdLevel2), course.title);
              }}
            >
              <img
                style={{ width: "100%", height: "170px" }}
                src={course.imageUrl}
                alt={course.title}
              />
            </Link>

            {/* Duration */}
            <span className="time">
              <svg
                className="me-1"
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.8505 9.91291L8.61967 8.23979V4.8316C8.61967 4.48891 8.34266 4.21191 7.99998 4.21191C7.65729 4.21191 7.38029 4.48891 7.38029 4.8316V8.54966C7.38029 8.74485 7.47201 8.92892 7.62817 9.04541L10.1069 10.9044C10.2138 10.985 10.3441 11.0285 10.478 11.0284C10.667 11.0284 10.8529 10.9435 10.9744 10.7799C11.1802 10.5066 11.1244 10.118 10.8505 9.91291Z"
                  fill="white"
                />
                <path
                  d="M8 0.5C3.58853 0.5 0 4.08853 0 8.5C0 12.9115 3.58853 16.5 8 16.5C12.4115 16.5 16 12.9115 16 8.5C16 4.08853 12.4115 0.5 8 0.5ZM8 15.2607C4.27266 15.2607 1.23934 12.2273 1.23934 8.5C1.23934 4.77266 4.27266 1.73934 8 1.73934C11.728 1.73934 14.7607 4.77266 14.7607 8.5C14.7607 12.2273 11.7273 15.2607 8 15.2607Z"
                  fill="white"
                />
              </svg>
              {course.duration}
            </span>
          </div>

          {/* Course Content */}
          <div
            className="courses__content pt-4"
            style={{ padding: "20px !important", height: "100%" }}
          >
            {/* Course Title */}
            <h3
              style={{
                minHeight: "40px",
                maxHeight: "70px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: "3",
                WebkitBoxOrient: "vertical",
              }}
            >
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCourseClick(course.id!, Number((course as any).courseCategoryId), Number((course as any).courseCategoryIdLevel1), Number((course as any).courseCategoryIdLevel2), course.title);
                }}
                className="primary-hover"
                title={course.title}
              >
                {course.title}
              </a>
            </h3>

            {/* Course Meta Info */}
            <ul className="d-flex align-items-center gap-4 my-3">
              {/* Students Count */}
              <li>
                <svg
                  className="me-1"
                  width="16"
                  height="14"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.99967 2.29208C7.74714 1.80254 7.36475 1.39195 6.89439 1.10526C6.42403 0.81858 5.88385 0.666869 5.33301 0.666748C3.67734 0.666748 2.33301 2.01108 2.33301 3.66675C2.33301 5.32241 3.67734 6.66675 5.33301 6.66675C5.88385 6.66663 6.42403 6.51492 6.89439 6.22823C7.36475 5.94155 7.74714 5.53095 7.99967 5.04142C8.25215 5.531 8.63453 5.94164 9.1049 6.22833C9.57527 6.51502 10.1155 6.6667 10.6663 6.66675C12.322 6.66675 13.6663 5.32241 13.6663 3.66675C13.6663 2.01108 12.322 0.666748 10.6663 0.666748C10.1155 0.666869 9.57532 0.81858 9.10496 1.10526C8.6346 1.39195 8.25221 1.80254 7.99967 2.29208ZM10.6663 1.33341C11.954 1.33341 12.9997 2.37908 12.9997 3.66675C12.9997 4.95441 11.954 6.00008 10.6663 6.00008C9.37867 6.00008 8.33301 4.95441 8.33301 3.66675C8.33301 2.37908 9.37867 1.33341 10.6663 1.33341ZM5.33301 1.33341C6.62067 1.33341 7.66634 2.37908 7.66634 3.66675C7.66634 4.95441 6.62067 6.00008 5.33301 6.00008C4.04534 6.00008 2.99967 4.95441 2.99967 3.66675C2.99967 2.37908 4.04534 1.33341 5.33301 1.33341ZM7.99967 7.58342C8.41301 7.42208 8.86267 7.33342 9.33301 7.33342H11.9997C14.0247 7.33342 15.6663 8.97508 15.6663 11.0001V12.3334C15.6663 12.5986 15.561 12.853 15.3734 13.0405C15.1859 13.2281 14.9316 13.3334 14.6663 13.3334H1.33301C1.06779 13.3334 0.813437 13.2281 0.625901 13.0405C0.438365 12.853 0.333008 12.5986 0.333008 12.3334V11.0001C0.333008 8.97508 1.97467 7.33342 3.99967 7.33342H6.66634C7.13667 7.33342 7.58634 7.42208 7.99967 7.58342ZM9.66634 11.0001V12.3334C9.66634 12.4218 9.63122 12.5066 9.56871 12.5691C9.5062 12.6316 9.42141 12.6667 9.33301 12.6667H1.33301C1.2446 12.6667 1.15982 12.6316 1.09731 12.5691C1.03479 12.5066 0.999674 12.4218 0.999674 12.3334V11.0001C0.999674 10.2044 1.31574 9.44137 1.87835 8.87876C2.44096 8.31615 3.20403 8.00008 3.99967 8.00008H6.66634C7.46199 8.00008 8.22505 8.31615 8.78766 8.87876C9.35027 9.44137 9.66634 10.2044 9.66634 11.0001ZM10.276 12.6667H14.6663C14.7547 12.6667 14.8395 12.6316 14.902 12.5691C14.9646 12.5066 14.9997 12.4218 14.9997 12.3334V11.0001C14.9997 10.2044 14.6836 9.44137 14.121 8.87876C13.5584 8.31615 12.7953 8.00008 11.9997 8.00008H9.33301C9.16267 8.00008 8.99534 8.01441 8.83267 8.04175C9.29799 8.38193 9.6764 8.82718 9.93711 9.34125C10.1978 9.85532 10.3335 10.4237 10.333 11.0001V12.3334C10.333 12.4504 10.313 12.5624 10.276 12.6667Z"
                    fill="#181818"
                  />
                </svg>
                <a className="primary-hover fs-14" href="#0">
                  {(course as any).studentCount} Học viên
                </a>
              </li>

              {/* Lessons Count */}
              <li>
                <svg
                  className="me-1"
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.1515 15.7576H2.00607C1.32728 15.7576 0.793945 15.2242 0.793945 14.5455V1.45455C0.793945 0.775765 1.32728 0.242432 2.00607 0.242432H11.9939C12.6727 0.242432 13.2061 0.775765 13.2061 1.45455V12.7758C13.2061 12.9212 13.1091 13.0182 12.9636 13.0182C12.8182 13.0182 12.7212 12.9212 12.7212 12.7758V1.45455C12.7212 1.04243 12.4061 0.72728 11.9939 0.72728H2.00607C1.59395 0.72728 1.27879 1.04243 1.27879 1.45455V14.5455C1.27879 14.9576 1.59395 15.2727 2.00607 15.2727H10.1515C10.297 15.2727 10.3939 15.3697 10.3939 15.5152C10.3939 15.6606 10.297 15.7576 10.1515 15.7576Z"
                    fill="#181818"
                  />
                  <path
                    d="M10.2001 15.7576H10.1758C10.0304 15.7576 9.93339 15.6606 9.93339 15.5152V13.6727C9.93339 13.0424 10.4425 12.5333 11.0728 12.5333H12.9395C13.0364 12.5333 13.1334 12.5818 13.1576 12.6788C13.2061 12.7758 13.1819 12.8727 13.1092 12.9455L10.3698 15.6849C10.3213 15.7333 10.2728 15.7576 10.2001 15.7576ZM11.0728 13.0182C10.7092 13.0182 10.4182 13.3091 10.4182 13.6727V14.9576L12.3576 13.0182H11.0728ZM7.0243 4.24244C7.00006 4.24244 6.97582 4.24244 6.95158 4.2182L3.55764 3.0788C3.46067 3.05456 3.38794 2.95759 3.38794 2.86062C3.38794 2.76365 3.46067 2.66668 3.55764 2.64244L6.95158 1.50305C7.00006 1.4788 7.04855 1.4788 7.09703 1.50305L10.394 2.64244C10.491 2.66668 10.5637 2.76365 10.5637 2.86062C10.5637 2.95759 10.491 3.05456 10.394 3.0788L7.09703 4.2182C7.07279 4.24244 7.04855 4.24244 7.0243 4.24244ZM4.38188 2.86062L7.0243 3.73335L9.56976 2.86062L7.0243 1.98789L4.38188 2.86062Z"
                    fill="#181818"
                  />
                  <path
                    d="M7.00002 5.59996C6.22426 5.59996 5.42426 5.55148 4.60002 5.45451C4.47881 5.43027 4.38184 5.3333 4.38184 5.21208V3.22421C4.38184 3.07875 4.47881 2.98178 4.62426 2.98178C4.76971 2.98178 4.86668 3.07875 4.86668 3.22421V4.9939C6.29699 5.13936 7.70305 5.1636 9.03638 4.9939V3.22421C9.03638 3.07875 9.13335 2.98178 9.27881 2.98178C9.42426 2.98178 9.52123 3.07875 9.52123 3.22421V5.21208C9.52123 5.3333 9.42426 5.43027 9.30305 5.45451C8.57578 5.55148 7.80002 5.59996 7.00002 5.59996ZM10.2 5.09087C10.0546 5.09087 9.95759 4.9939 9.95759 4.84845V3.03027C9.95759 2.88481 10.0546 2.78784 10.2 2.78784C10.3455 2.78784 10.4424 2.88481 10.4424 3.03027V4.84845C10.4424 4.9939 10.3455 5.09087 10.2 5.09087Z"
                    fill="#181818"
                  />
                  <path
                    d="M10.3702 5.18797H10.055C9.90955 5.18797 9.81258 5.091 9.81258 4.94555C9.81258 4.80009 9.90955 4.70312 10.055 4.70312H10.3702C10.5156 4.70312 10.6126 4.80009 10.6126 4.94555C10.6126 5.091 10.5156 5.18797 10.3702 5.18797ZM10.8308 7.53949H5.86107C5.71561 7.53949 5.61864 7.44252 5.61864 7.29706C5.61864 7.15161 5.71561 7.05464 5.86107 7.05464H10.8308C10.9762 7.05464 11.0732 7.15161 11.0732 7.29706C11.0732 7.44252 10.9762 7.53949 10.8308 7.53949ZM10.8308 9.55161H5.86107C5.71561 9.55161 5.61864 9.45464 5.61864 9.30919C5.61864 9.16373 5.71561 9.06676 5.86107 9.06676H10.8308C10.9762 9.06676 11.0732 9.16373 11.0732 9.30919C11.0732 9.45464 10.9762 9.55161 10.8308 9.55161ZM10.8308 11.5637H5.86107C5.71561 11.5637 5.61864 11.4668 5.61864 11.3213C5.61864 11.1759 5.71561 11.0789 5.86107 11.0789H10.8308C10.9762 11.0789 11.0732 11.1759 11.0732 11.3213C11.0732 11.4668 10.9762 11.5637 10.8308 11.5637ZM8.35804 13.5759H5.86107C5.71561 13.5759 5.61864 13.4789 5.61864 13.3334C5.61864 13.188 5.71561 13.091 5.86107 13.091H8.35804C8.50349 13.091 8.60046 13.188 8.60046 13.3334C8.60046 13.4789 8.50349 13.5759 8.35804 13.5759ZM4.06713 7.97585H3.17016C3.0247 7.97585 2.92773 7.87888 2.92773 7.73343V6.83646C2.92773 6.691 3.0247 6.59403 3.17016 6.59403H4.06713C4.21258 6.59403 4.30955 6.691 4.30955 6.83646V7.73343C4.30955 7.87888 4.21258 7.97585 4.06713 7.97585ZM3.41258 7.491H3.8247V7.07888H3.41258V7.491ZM4.06713 9.98797H3.17016C3.0247 9.98797 2.92773 9.891 2.92773 9.74555V8.84858C2.92773 8.70312 3.0247 8.60616 3.17016 8.60616H4.06713C4.21258 8.60616 4.30955 8.70312 4.30955 8.84858V9.74555C4.30955 9.891 4.21258 9.98797 4.06713 9.98797ZM3.41258 9.50313H3.8247V9.091H3.41258V9.50313ZM4.06713 12.0001H3.17016C3.0247 12.0001 2.92773 11.9031 2.92773 11.7577V10.8607C2.92773 10.7152 3.0247 10.6183 3.17016 10.6183H4.06713C4.21258 10.6183 4.30955 10.7152 4.30955 10.8607V11.7577C4.30955 11.9031 4.21258 12.0001 4.06713 12.0001ZM3.41258 11.5152H3.8247V11.1031H3.41258V11.5152ZM4.06713 14.0122H3.17016C3.0247 14.0122 2.92773 13.9152 2.92773 13.7698V12.8728C2.92773 12.7274 3.0247 12.6304 3.17016 12.6304H4.06713C4.21258 12.6304 4.30955 12.7274 4.30955 12.8728V13.7698C4.30955 13.9152 4.21258 14.0122 4.06713 14.0122ZM3.41258 13.5274H3.8247V13.1152H3.41258V13.5274Z"
                    fill="#181818"
                  />
                </svg>
                <a className="primary-hover fs-14" href="#0">
                  {(course as any).lessonCount} Bài học
                </a>
              </li>
            </ul>

            {/* Course Footer */}
            <div
              className="bor-top pt-3 d-flex align-items-center justify-content-between gap-3"
              style={{ marginTop: "15px" }}
            >
              <div className="star" style={{ minWidth: "90px", flexShrink: 0 }}>
                {[...Array(5)].map((_, index) => (
                  <i
                    key={index}
                    className={`fa-sharp fa-solid fa-star ${index < Math.floor((course as any).rating) ? "" : "disabled"
                      }`}
                    style={{ fontSize: "14px" }}
                  ></i>
                ))}
              </div>
              {renderCoursePrice(course)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  const hasCourses =
    filteredCourses.length > 0 && !filteredCourses.every((course) => course.status === false);

  return (
    <div className="row g-4">
      {/* Navigation sidebar */}
      <NavCourse />

      {/* Course listings */}
      <div className="col-xl-9 col-lg-8 col-md-12">
        {/* Search bar */}
        <div className="search-container mb-4" style={{ width: "100%" }}>
          <div className="search-bar" style={{
            display: "flex",
            maxWidth: "500px",
            margin: "0 auto 20px",
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              onChange={handleSearchChange}
              value={searchTerm}
              className="search-input"
              style={{
                flex: "1",
                padding: "12px 15px",
                fontSize: "15px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {hasCourses ? (
          <div className="row g-4" id="listCourseProductCat">
            {filteredCourses.map((course) => course.status && renderCourseCard(course))}
          </div>
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}

export default CourseList;
