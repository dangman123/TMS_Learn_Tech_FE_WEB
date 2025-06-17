import React, { useEffect, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { toast, ToastContainer } from "react-toastify";
import { CoureseDetail } from "../../../../model/CoureseDetail";

interface Review {
  id: number;
  rating: number;
  review: string;
  updated_at: string;
  created_at: string;
  account_id: number;
  fullname: string;
  image: string;
  course_id?: number;
  test_id?: number | null;
}

// Custom CSS for review UI
const reviewStyles = `
  .review-item {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    padding: 20px;
    margin-bottom: 20px;
  }
  .review-item-top img { border-radius: 50%; object-fit: cover; }
  .review-title div:first-child { font-weight: 600; color: #344767; }
  .review-start-user i { color: #ffd700; margin-right: 2px; }
  .pagination { display:flex; justify-content:center; align-items:center; gap:8px; margin-top:10px; }
  .pagination button { border:none; background:none; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:14px; color:#495057; transition:all 0.2s; }
  .pagination button:hover { background:#e9ecef; }
  .pagination button.active { background:#4e73df; color:#fff; box-shadow:0 2px 6px rgba(0,0,0,0.1); }

  /* CKEditor editable area */
  .review-form .ck-editor__editable_inline {
    min-height: 120px;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .review-item-top { display:flex; align-items:center; gap:12px; }
  .review-date { color:#6c757d; font-size:14px; }
  .review-item-content span { display:block; margin-top:4px; }
`;
export interface CourseContent {
  course: CoureseDetail; // Danh sách các bài học trong khóa học
}
export const CourseReview: React.FC<CourseContent> = ({course}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [rating, setRating] = useState(0);
  const reviewsPerPage = 3; // Số lượng review hiển thị trên mỗi trang
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  // Tính toán số lượng trang
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const [loading, setLoading] = useState(false);
  // Lấy các reviews hiển thị cho trang hiện tại
  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
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
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  // State to track which reviews are expanded (show full text)
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});
  const toggleExpand = (id: number) =>
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));

  // Check enrollment
  useEffect(() => {
    const user = getUserData();
    if (!id || !user) return;
    fetch(
      `${process.env.REACT_APP_SERVER_HOST}/api/enrollments/check?courseId=${id}&accountId=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setIsEnrolled(data.data === true);
      })
      .catch(() => setIsEnrolled(false));
  }, [id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/reviews/course/${Number(id)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result && result.data && result.data.content) {
        setReviews(result.data.content);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm thay đổi trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  useEffect(() => {
    fetchReviews();
  }, []);
  const handleSubmitReview = async () => {
    if (rating === 0 || content.trim() === "") {
      // alert("");
      toast.warning("Vui lòng nhập đủ thông tin đánh giá.!");
      return;
    }

    let token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập tài khoản !");
      return;
    }


    try {
      const plainTextContent = content.replace(/<[^>]*>/g, "");
      setSubmitting(true);
      const user = getUserData();
      const newReview = {
        rating,
        review: plainTextContent,
        account_id: user.id,
        course_id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // console.log(newReview);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/reviews/course`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok && response.status === 201) {
        const data = await response.json();
        setRating(0);
        setContent("");
        setIsFormVisible(false);
        toast.success("Đánh giá khóa học thành công !");
        // setReviews(data);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (response.status === 400) {
        const errorData = await response.text();
        toast.warning("Bạn đã đánh giá khóa học!");
      } else {
        toast.error("Lỗi đánh giá! Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Inject styles once
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = reviewStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="courses-details__item-left" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", marginTop: "10px" }}>
      <div className="title-course">
        <h3 className="mt-20 mb-20" style={{ textAlign:"center" }}>Review Khóa Học</h3>
      </div>
     

      {course.purchased && (
        <div
          className="review-form"
          style={{ marginTop: "10px", fontSize: "16px" }}
        >
          <hr style={{ width: "100%" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label style={{ marginRight: "5px" }}>Số sao : </label>
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                style={{
                  cursor: "pointer",
                  color: index < rating ? "#FFD700" : "#ccc",
                  fontSize: "30px",
                }}
                onClick={() => setRating(index + 1)}
              >
                ★
              </span>
            ))}
          </div>
          <div>
            <label style={{ marginBottom: "15px" }}>Nội dung:</label>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              config={{
                removePlugins: [
                  "CKFinder",
                  "Image",
                  "MediaEmbed",
                  "ImageToolbar",
                  "ImageUpload",
                  "ImageCaption",
                  "EasyImage",
                ],
                toolbar: [
                  "heading",
                  "bold",
                  "italic",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "undo",
                ],
             
              }}
              onChange={(event: any, editor: any) => {
                const data = editor.getData();
                // const plainText = data.replace(/<[^>]*>/g, "");
                setContent(data);
              }}
            />
          </div>
          <button
            className="btn-one blue float-end"
            onClick={handleSubmitReview}
            disabled={submitting}
            style={{
              marginTop: "10px",
              backgroundColor: "blue",
              marginBottom: "10px",
            }}
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      )}
      <hr style={{ width: "100%" }} />

      <div className="course-review-bottom">
        {currentReviews.length === 0 ? (
          <p>Không có dữ liệu đánh giá.</p>
        ) : (
          currentReviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-item-top">
                <img
                  src={review.image}
                  alt={review.fullname}
                  width={"50px"}
                  height={"50px"}
                />
                <div className="review-title">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600 }}>{review.fullname}</span>
                    <span className="review-date" style={{ color: "#6c757d", fontSize: "14px" }}>
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="review-start-user">
                      {[...Array(review.rating)].map((_, index) => (
                        <i
                          key={`filled-${index}`}
                          className="fa fa-star"
                          aria-hidden="true"
                        ></i>
                      ))}
                      {[...Array(5 - review.rating)].map((_, index) => (
                        <i
                          key={`empty-${index}`}
                          className="fa fa-star-o"
                          aria-hidden="true"
                        ></i>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="review-item-content"
                style={{ margin: "10px 50px 10px 50px" }}
              >
                <p
                  style={
                    expandedReviews[review.id]
                      ? {}
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }
                  }
                >
                  {review.review}
                </p>
                {review.review.length > 200 && (
                  <span
                    onClick={() => toggleExpand(review.id)}
                    style={{ color: "#007bff", cursor: "pointer" }}
                  >
                    {expandedReviews[review.id] ? "Thu gọn" : "Xem thêm"}
                  </span>
                )}
              </div>
              <hr style={{ margin: "15px 0px" }} />
            </div>
          ))
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <ul className="pagination">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icon.ChevronLeft />
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index}>
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li style={{marginBottom:"20px"}}>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Icon.ChevronRight />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};
