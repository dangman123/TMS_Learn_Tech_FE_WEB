import React, { useEffect, useState } from "react";
import * as Icon from "react-bootstrap-icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./style.css";
import { useParams } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { toast, ToastContainer } from "react-toastify";

interface Review {
  id: number;
  rating: number;
  review: string;
  updated_at: string;
  created_at: string;
  account_id: number;
  fullname: string;
  image: string;
}

interface CourseReviewProps {
  reviews: Review[];
}

export const CourseReview: React.FC = () => {
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
  const { id } = useParams<{ id: string }>();
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/reviews/course/${id}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data); // Giả sử API trả về một mảng các review
    } catch (error) {
      console.error("Error fetching reviews:", error);
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

    // if (isTokenExpired(token) || !token) {
    //   token = await refresh();
    //   if (!token) {
    //     window.location.href = "/dang-nhap";
    //     return;
    //   }
    //   localStorage.setItem("authToken", token);
    // }

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

  return (
    <div className="courses-details__item-left" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", marginTop: "10px" }}>
      <div className="title-course">
        <h3 className="mt-20 mb-20" style={{ textAlign:"center" }}>Review Khóa Học</h3>
      </div>
      {/* <div
        className="open-post-review"
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          fontWeight: "700",
          fontSize: "18px",
          gap: "6px",
        }}
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-plus-circle"
          viewBox="0 0 16 16"
        >
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
        </svg>
        <span style={{ marginLeft: "5px" }}>Tạo đánh giá</span>
      </div> */}

      {/* {isFormVisible && (
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
      )} */}
      <hr style={{ width: "100%" }} />

      <div className="course-review-bottom">
        {currentReviews.length === 0 ? (
          <p>No reviews available.</p>
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
                  <div>{review.fullname}</div>
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
                <p>{review.review}</p>
              </div>
              <hr style={{ margin: "15px 0px" }} />
            </div>
          ))
        )}

        {/* Phân trang */}
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
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Icon.ChevronRight />
              </button>
            </li>
          </ul>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
