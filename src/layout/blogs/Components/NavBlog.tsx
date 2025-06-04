import React, { useState, useRef, useEffect } from "react";
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

interface NavBlogProps {
  categories: BlogCategory[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null, categoryName: string | null) => void;
  onSearch: (term: string) => void;
  allBlogs: BlogModel[];
}

const NavBlog: React.FC<NavBlogProps> = ({ categories, selectedCategoryId, onCategorySelect, onSearch, allBlogs }) => {
  // State cho chức năng tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState<BlogModel[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLDivElement>(null);
  const [searchPosition, setSearchPosition] = useState({ top: 0, left: 0, width: 0 });

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

  // Xử lý tìm kiếm cục bộ
  const handleLocalSearch = (value: string) => {
    if (value.trim() === "") {
      setShowResults(false);
      setFilteredBlogs([]);
      return;
    }
    
    // Tìm kiếm trong dữ liệu hiện có
    const searchLower = value.toLowerCase();
    const results = allBlogs.filter(blog => 
      blog.title.toLowerCase().includes(searchLower) || 
      blog.authorName.toLowerCase().includes(searchLower)
    );
    
    // Giới hạn kết quả hiển thị
    setFilteredBlogs(results.slice(0, 5));
    setShowResults(true);
  };

  // Sử dụng useEffect để tìm kiếm với debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim()) {
        handleLocalSearch(searchTerm);
      }
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm, allBlogs]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      onSearch(searchTerm);
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
    onCategorySelect(id, name);
  };

  const handleAllCategoriesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onCategorySelect(null, null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      setShowResults(false);
      setFilteredBlogs([]);
      onSearch("");
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
              onClick={() => {
                onSearch(searchTerm);
                setShowResults(false);
              }}
              className="blog-search-button"
            >
              <Search />
            </button>
          </div>
        </div>
        
        <div className="blog-body">
          <ul className="category-list">
            {/* Thêm "Tất cả bài viết" vào đầu danh sách */}
            <li className={`category-item ${selectedCategoryId === null ? "active" : ""}`}>
              <div className="category-row">
                <a
                  href="#"
                  className="category-name"
                  onClick={handleAllCategoriesClick}
                >
                  <FileText className="category-icon" />
                  <span>Tất cả bài viết</span>
                </a>
              </div>
            </li>

            {categories.map((category) => (
              <li
                key={category.id}
                className={`category-item ${selectedCategoryId === category.id ? "active" : ""}`}
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
          {filteredBlogs.length > 0 ? (
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
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  onSearch(searchTerm);
                  setShowResults(false);
                }}>
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
