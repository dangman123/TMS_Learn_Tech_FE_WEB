import React, { useState, useEffect } from "react";
import axios from "axios";
import { BlogItem } from "./Components/BlogItem";
import { GET_USER_BLOGS } from "../../api/api";

interface BlogModel {
  id: number,
  title: string,
  content: string,
  created_at: Date,
  updated_at: Date,
  author_id: number,
  cat_blog_id: number,
  status: true,
  image : string,
  author_name : string,
  category_name : string
}
function Blogs() {
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading
  const [page, setPage] = useState(0); // Quản lý trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang từ API

  const pageSize = 6; // Số lượng bài viết trên mỗi trang

  useEffect(() => {
    fetchBlogs(page); // Gọi hàm fetch khi component được render
  }, [page]);

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
        setBlogs(response.data.content); // Lưu dữ liệu blog vào state
        setTotalPages(response.data.totalPages); // Lưu tổng số trang
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

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading khi dữ liệu đang được tải
  }

  return (
    <section className="blog-area  pb-120">
      <div className="container">
        <div className="row g-4">
          {blogs.map((blog) => (
            <BlogItem key={blog.id} blog={blog} />
          ))}
        </div>
        <div className="pegi justify-content-center mt-60">
          <a
            href="#0"
            className={`border-none ${page === 0 ? "disabled" : ""}`}
            onClick={() => handlePageChange(page - 1)}
          >
            <i className="fa-regular fa-arrow-left primary-color transition"></i>
          </a>
          {[...Array(totalPages)].map((_, index) => (
            <a
              key={index}
              href="#0"
              className={index === page ? "active" : ""}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </a>
          ))}
          <a
            href="#0"
            className={`border-none ${
              page === totalPages - 1 ? "disabled" : ""
            }`}
            onClick={() => handlePageChange(page + 1)}
          >
            <i className="fa-regular fa-arrow-right primary-color transition"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Blogs;
