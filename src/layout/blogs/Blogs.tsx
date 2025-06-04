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

interface BlogCategory {
  id: number;
  name: string;
  level: number;
  type: string;
  description: string | null;
  itemCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function Blogs() {
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [sortCriterion, setSortCriterion] = useState<
    "featured" | "most-viewed" | "newest"
  >("newest");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allBlogs, setAllBlogs] = useState<BlogModel[]>([]);

  const pageSize = 10; // Số lượng bài viết trên mỗi trang

  // Hàm để tăng lượt xem khi người dùng xem bài viết
  const incrementViewCount = async (blogId: string | number) => {
    try {
      await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/${blogId}/views`, {
        method: 'PUT',
      });
      // No need to handle the response, just fire and forget
    } catch (error) {
      console.error("Error incrementing view count:", error);
      // Don't show an error to the user, this is non-critical functionality
    }
  };

  // Hàm chuyển chuỗi thành slug
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  // Hàm cắt bớt nội dung tiêu đề nếu quá dài
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === "") {
      // Nếu không có từ khóa tìm kiếm, hiển thị lại danh sách theo tiêu chí sắp xếp và phân trang
      setFilteredBlogs([]);
      return;
    }

    // Tìm kiếm trong dữ liệu đã tải về
    const term_lower = term.toLowerCase();
    const results = allBlogs.filter(blog => 
      blog.title.toLowerCase().includes(term_lower) || 
      blog.authorName.toLowerCase().includes(term_lower)
    );

    setFilteredBlogs(results);
  };

  useEffect(() => {
    // Tải danh mục blog
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/categories/level3/blog`
        );

        if (response.data.status === 200) {
          setCategories(response.data.data);
        } else {
          console.error("Error fetching blog categories:", response.data.message);
        }

        // Kiểm tra danh mục đã chọn từ localStorage
        const savedCategoryId = localStorage.getItem("iddanhmucblog");
        if (savedCategoryId) {
          const categoryId = parseInt(savedCategoryId, 10);
          setSelectedCategoryId(categoryId);
          
          // Tìm tên danh mục từ danh sách để hiển thị
          const category = response.data.data.find((cat: BlogCategory) => cat.id === categoryId);
          if (category) {
            setSelectedCategoryName(category.name);
          }
        }
      } catch (error) {
        console.error("Error fetching blog categories:", error);
      }
    };

    // Tải dữ liệu ban đầu
    fetchCategories();
    
    // Tải tất cả bài viết để phục vụ tìm kiếm
    const fetchAllBlogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/public`, {
          params: { 
            size: 100 // Lấy nhiều bài viết để phục vụ tìm kiếm
          }
        });
        
        if (response.data.status === 200) {
          const blogsData = response.data.data.content || [];
          setAllBlogs(blogsData);
        }
      } catch (error) {
        console.error("Error fetching all blogs for search:", error);
      }
    };
    
    fetchAllBlogs();
  }, []);

  // Load blogs khi page, sortCriterion, hoặc selectedCategoryId thay đổi
  useEffect(() => {
    loadBlogs();
  }, [page, sortCriterion, selectedCategoryId]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      // Chuẩn bị tham số cho API
      const params: any = {
        page: page,
        size: pageSize,
      };

      // Thêm tham số categoryId nếu có danh mục được chọn
      if (selectedCategoryId !== null) {
        params.categoryId = selectedCategoryId;
      }

      // Gọi API với tham số phù hợp
      const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/public`, {
        params: params,
      });

      if (response.data.status === 200) {
        const blogsData = response.data.data.content || [];
        
        // Sắp xếp bài viết theo tiêu chí
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
        
        setBlogs(sortedBlogs);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null, categoryName: string | null) => {
    setPage(0); // Reset về trang đầu
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setSearchTerm(""); // Xóa từ khóa tìm kiếm khi chuyển danh mục
    setFilteredBlogs([]);
    
    // Lưu trạng thái vào localStorage
    if (categoryId !== null && categoryName !== null) {
      localStorage.setItem("iddanhmucblog", categoryId.toString());
      localStorage.setItem("danhmucblog", removeVietnameseTones(categoryName));
    } else {
      localStorage.removeItem("iddanhmucblog");
      localStorage.removeItem("danhmucblog");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };
  
  const handleSortChange = (
    criterion: "featured" | "most-viewed" | "newest"
  ) => {
    setSortCriterion(criterion);
    setPage(0); // Reset về trang đầu tiên
  };

  // Xác định danh sách bài viết để hiển thị
  const displayBlogs = searchTerm.trim() !== "" ? filteredBlogs : blogs;

  return (
    <section className="blog-area pb-120">
      <div className="container">
        <div className="row">
          <NavBlog 
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
            onSearch={handleSearch}
            allBlogs={allBlogs}
          />
          <div className="col-xl-9 col-lg-8 col-md-12">
            {/* Hiển thị tiêu đề danh mục đang chọn */}
            {selectedCategoryName && !searchTerm && (
              <div className="category-header">
                <h2>{selectedCategoryName}</h2>
              </div>
            )}
            
            {/* Hiển thị tiêu đề tìm kiếm nếu đang tìm kiếm */}
            {searchTerm && (
              <div className="search-header">
                <h2>Kết quả tìm kiếm: {searchTerm}</h2>
                <p>{filteredBlogs.length} kết quả được tìm thấy</p>
              </div>
            )}
            
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
            
            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : displayBlogs.length > 0 ? (
              <>
                <div className="row g-4">
                  {displayBlogs.map((blog) => (
                    <BlogItem 
                      key={blog.id} 
                      blog={{
                        ...blog,
                        title: truncateTitle(blog.title)
                      }} 
                      onViewIncrement={incrementViewCount}
                    />
                  ))}
                </div>
                {!searchTerm && (
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
                )}
              </>
            ) : (
              <div className="no-blogs">
                <div className="no-data-icon">
                  <i className="fa fa-newspaper-o" aria-hidden="true"></i>
                </div>
                <h3>Không có bài viết</h3>
                <p>{searchTerm ? `Không tìm thấy bài viết nào với từ khóa "${searchTerm}"` : 
                   selectedCategoryName ? `Hiện chưa có bài viết nào trong danh mục ${selectedCategoryName}` : 
                   "Hiện chưa có bài viết nào"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Blogs;
