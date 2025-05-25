import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FileText,
  Search,
} from "react-bootstrap-icons";
import "./navBlog.css";
import { useNavigate } from "react-router-dom";

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

const NavBlog = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // State cho chức năng tìm kiếm
  const [blogsSearch, setBlogsSearch] = useState<BlogModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<BlogModel[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [searchPosition, setSearchPosition] = useState({ top: 0, left: 0, width: 0 });

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

  useEffect(() => {
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

        // Kiểm tra xem có danh mục blog nào đã được chọn trước đó không
        const currentCategoryId = localStorage.getItem("iddanhmucblog");
        if (currentCategoryId) {
          setSelectedCategory(parseInt(currentCategoryId, 10));
        }
      } catch (error) {
        console.error("Error fetching blog categories:", error);
      }
    };

    // Tải dữ liệu tìm kiếm blog cho tìm kiếm offline
    const fetchSearchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/blogs/search-data`
        );
        
        if (response.data.status === 200) {
          setBlogsSearch(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching blog search data:", error);
      }
    };

    fetchCategories();
    fetchSearchData();
  }, []);

  // Xử lý tìm kiếm với debounce
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setShowResults(false);
      setFilteredBlogs([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Gọi API tìm kiếm theo tên tác giả và tên bài viết
      if (value.trim().length > 1) {
        const params: any = { search: value.trim() };
        
        // Thêm categoryId nếu có danh mục được chọn
        if (selectedCategory) {
          params.categoryId = selectedCategory;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/blogs/public`, 
          { params }
        );
        
        if (response.data.status === 200) {
          const apiResults = response.data.data?.content || [];
          
          // Tìm kiếm thêm trong dữ liệu cục bộ theo tiêu đề
          const localResults = blogsSearch.filter(
            blog => blog.title.toLowerCase().includes(value.toLowerCase())
          );
          
          // Kết hợp và loại bỏ trùng lặp bằng Set
          const combinedResultsMap = new Map();
          
          // Thêm kết quả từ API
          apiResults.forEach((blog: BlogModel) => {
            combinedResultsMap.set(blog.id, blog);
          });
          
          // Thêm kết quả cục bộ nếu chưa có trong map
          localResults.forEach(blog => {
            if (!combinedResultsMap.has(blog.id)) {
              combinedResultsMap.set(blog.id, blog);
            }
          });
          
          // Chuyển Map thành Array
          const combinedResults = Array.from(combinedResultsMap.values());
          
          // Giới hạn kết quả và hiển thị
          setFilteredBlogs(combinedResults.slice(0, 5));
          setShowResults(true);
        }
      } else {
        // Tìm kiếm cục bộ cho các từ ngắn
        const results = blogsSearch.filter(blog => 
          blog.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredBlogs(results.slice(0, 5));
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error searching blogs:", error);
      // Fallback tìm kiếm cục bộ nếu API lỗi
      const results = blogsSearch.filter(blog => 
        blog.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBlogs(results.slice(0, 5));
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Thêm debounce để tránh gọi API quá nhiều
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length > 1) {
        handleSearch({ target: { value: searchTerm } } as React.ChangeEvent<HTMLInputElement>);
      }
    }, 300); // Đợi 300ms sau khi ngừng gõ

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/tim-kiem-blog?keyword=${searchTerm}`);
      setShowResults(false);
    }
  };

  const handleBlur = () => {
    // Sử dụng setTimeout để đảm bảo onClick của kết quả không bị bỏ qua
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Cập nhật vị trí kết quả tìm kiếm
  const updateSearchResultsPosition = () => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setSearchPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    // Cập nhật vị trí khi hiển thị kết quả
    if (showResults) {
      updateSearchResultsPosition();
    }
    
    // Thêm event listener để cập nhật vị trí khi cuộn trang
    window.addEventListener('scroll', updateSearchResultsPosition);
    window.addEventListener('resize', updateSearchResultsPosition);
    
    return () => {
      window.removeEventListener('scroll', updateSearchResultsPosition);
      window.removeEventListener('resize', updateSearchResultsPosition);
    };
  }, [showResults]);

  const handleFocus = () => {
    if (searchTerm.trim() !== "") {
      setShowResults(true);
    }
    updateSearchResultsPosition();
  };

  const handleCategoryClick = (id: number, name: string) => {
    setSelectedCategory(id);
    localStorage.setItem("iddanhmucblog", id.toString());
    localStorage.setItem("danhmucblog", removeVietnameseTones(name));
    navigate(`/danh-muc-blog/${removeVietnameseTones(name)}`);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setShowResults(false);
      setFilteredBlogs([]);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-12">
      <div className="blog-card">
        <div className="blog-header">
          <h3 className="blog-title">Danh mục blog</h3>
        </div>
        
        <div className="blog-search">
          <div className="search-input-container" ref={searchInputRef}>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, tác giả..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="blog-search-input"
            />
            <button 
              onClick={() => navigate(`/tim-kiem-blog?keyword=${searchTerm}`)}
              className="blog-search-button"
            >
              <Search />
            </button>
          </div>
        </div>
        
        <div className="blog-body">
          <ul className="category-list">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`category-item ${selectedCategory === category.id ? "active" : ""}`}
              >
                <div className="category-row">
                  <a
                    href="#"
                    className="category-name"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(category.id, category.name);
                    }}
                  >
                    <FileText className="category-icon" />
                    <span>{category.name}</span>
                    {category.itemCount > 0 && (
                      <span className="blog-count">({category.itemCount})</span>
                    )}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Kết quả tìm kiếm */}
      {showResults && searchTerm && (
        <div className="blog-search-results" style={{
          position: 'fixed',
          top: `${searchPosition.top}px`,
          left: `${searchPosition.left}px`,
          width: `${searchPosition.width}px`,
          zIndex: 9999
        }}>
          {isSearching ? (
            <div className="blog-search-loading">
              <div className="spinner-small"></div>
              <span>Đang tìm kiếm...</span>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <>
              {filteredBlogs.map((blog) => (
                <div className="blog-search-result-item" key={blog.id}>
                  <a
                    href={`/bai-viet/${blog.id}`}
                    onClick={() => setShowResults(false)}
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="blog-search-result-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=Blog';
                      }}
                    />
                    <div className="blog-search-result-info">
                      <span className="blog-search-result-title">
                        {blog.title}
                      </span>
                      <span className="blog-search-result-author">
                        Tác giả: {blog.authorName}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
              
              <div className="blog-search-view-all">
                <a href={`/tim-kiem-blog?keyword=${searchTerm}`}>
                  Xem tất cả kết quả
                </a>
              </div>
            </>
          ) : (
            <div className="blog-search-no-results">
              Không tìm thấy kết quả nào phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavBlog;
