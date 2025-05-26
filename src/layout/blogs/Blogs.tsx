import React, { useState, useEffect } from "react";
import axios from "axios";
import { BlogItem } from "./Components/BlogItem";
import NavBlog from "./Components/NavBlog";
import { GET_USER_BLOGS } from "../../api/api";
import "./styleBlog.css";

interface BlogModel {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  featured: boolean;
  cat_blog_id: string;
  image: string;
  views: number;
  commentCount: number;
  deletedDate: string;
  categoryName: string;
  authorName: string;
  deleted: boolean;
}

function Blogs() {
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading
  const [page, setPage] = useState(0); // Quản lý trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang từ API
  const [sortCriterion, setSortCriterion] = useState<
    "featured" | "most-viewed" | "newest"
  >("newest");

  const pageSize = 10; // Số lượng bài viết trên mỗi trang

  useEffect(() => {
    fetchBlogs(page); // Gọi hàm fetch khi component được render
  }, [page, sortCriterion]);

  const fetchBlogs = (page:number) => {
    setLoading(true); // Bắt đầu trạng thái loading
    axios
      .get(GET_USER_BLOGS, {
        params: {
          page: page, // Trang hiện tại
          size: pageSize, // Kích thước của mỗi trang
        },
      })
      .then((response) => {
        const blogsData = response.data.data.content;
        
        // Sắp xếp bài viết theo tiêu chí đã chọn
        const sortedBlogs = [...blogsData].sort((a, b) => {
          switch (sortCriterion) {
            case "featured":
              return b.commentCount - a.commentCount;
            case "most-viewed":
              return b.views - a.views;
            case "newest":
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            default:
              return 0;
          }
        });
        
        setBlogs(sortedBlogs); // Lưu dữ liệu blog vào state
        setTotalPages(response.data.data.totalPages); // Lưu tổng số trang
        setLoading(false); // Kết thúc trạng thái loading
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false); // Kết thúc trạng thái loading nếu có lỗi
      });
  };

  const handlePageChange = (newPage:number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage); // Cập nhật trang khi người dùng chuyển trang
    }
  };
  
  const handleSortChange = (
    criterion: "featured" | "most-viewed" | "newest"
  ) => {
    setSortCriterion(criterion);
    setPage(0); // Reset về trang đầu tiên
  };

  if (loading) {
    return (
      <section className="blog-area pb-120">
        <div className="container">
          <div className="row">
            <NavBlog />
            <div className="col-xl-9 col-lg-8 col-md-12">
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-area pb-120">
      <div className="container">
        <div className="row">
          <NavBlog />
          <div className="col-xl-9 col-lg-8 col-md-12">
            <div style={{ textAlign: "right", margin: "10px 0px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("featured");
                }}
                className={sortCriterion === "featured" ? "active" : ""}
              >
                <span className="sort-option">Nổi bật |</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("most-viewed");
                }}
                className={sortCriterion === "most-viewed" ? "active" : ""}
              >
                <span className="sort-option">Xem nhiều |</span>
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSortChange("newest");
                }}
                className={sortCriterion === "newest" ? "active" : ""}
              >
                <span className="sort-option">Mới đăng</span>
              </a>
            </div>
            
            {blogs.length > 0 ? (
              <>
                <div className="row g-4">
                  {blogs.map((blog) => (
                    <BlogItem key={blog.id} blog={blog} />
                  ))}
                </div>
                <div className="pegi justify-content-center mt-60">
                  <a
                    href="#0"
                    className={`border-none ${page === 0 ? "disabled" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                  >
                    <i className="fa-regular fa-arrow-left primary-color transition"></i>
                  </a>
                  {[...Array(totalPages)].map((_, index) => (
                    <a
                      key={index}
                      href="#0"
                      className={index === page ? "active" : ""}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(index);
                      }}
                    >
                      {index + 1}
                    </a>
                  ))}
                  <a
                    href="#0"
                    className={`border-none ${
                      page === totalPages - 1 ? "disabled" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                  >
                    <i className="fa-regular fa-arrow-right primary-color transition"></i>
                  </a>
                </div>
              </>
            ) : (
              <div className="no-blogs">
                <div className="no-data-icon">
                  <i className="fa fa-newspaper-o" aria-hidden="true"></i>
                </div>
                <h3>Không có bài viết</h3>
                <p>Hiện chưa có bài viết nào trong danh mục này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blogs;
