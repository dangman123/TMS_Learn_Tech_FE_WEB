import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./style.css";

interface DocumentLoad {
  id: number;
  title: string;
  image: string;
  url: string;
  view: number;
  createdAt: string;
  description: string;
  categoryName: string;
}
type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const Search: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);

  const query = new URLSearchParams(location.search);
  const keyword = query.get("keyword") || "";

  const handleDocumentClick = async (docId: any, idDanhMuc: any) => {
    categories.forEach((categorie) => {
      if (categorie.id === idDanhMuc) {
        localStorage.setItem(
          "danhmuctailieu",
          removeVietnameseTones(categorie.name)
        );
      }
    });

    try {
      // Gửi yêu cầu POST để tăng số lượt xem tài liệu
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${docId}/increment-view`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: docId,
          }),
        }
      );

      if (response.ok) {
        let danhmuctailieu = localStorage.getItem("danhmuctailieu");
        // Nếu cập nhật thành công, chuyển hướng đến trang chi tiết tài liệu
        window.location.href = `/tai-lieu/${danhmuctailieu}/${docId}`;
      } else {
        console.error("Failed to increment view count");
      }
    } catch (error) {
      console.error("Error incrementing view count", error);
    }
  };
  const removeVietnameseTones = (str: any) => {
    return str
      .normalize("NFD") // Chuyển đổi ký tự Unicode
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/đ/g, "d") // Thay thế chữ đ thường
      .replace(/Đ/g, "D") // Thay thế chữ Đ hoa
      .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .toLowerCase(); // Chuyển tất cả thành chữ thường
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "${process.env.REACT_APP_SERVER_HOST}/categories-all"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  useEffect(() => {
    if (keyword) {
      // Gọi API khi từ khóa có thay đổi
      setLoading(true);
      axios
        .get(
          `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/search-query?keyword=${keyword}&page=${currentPage}&size=16`
        )
        .then((response) => {
          setDocuments(response.data.content); // Lấy dữ liệu từ content
          setTotalPages(response.data.totalPages); // Lấy số trang từ API
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching documents:", error);
          setLoading(false);
        });
    }
  }, [keyword, currentPage]);

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="menu-search">
          <h3 className="top-seach-h3">
            Kết quả tìm kiếm cho từ khóa: <i>"{keyword}"</i>
          </h3>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : documents.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Không có kết quả tìm kiếm cho từ khóa: <i>"{keyword}"</i>
            </p>
          ) : (
            <div id="listDocProductCat" className="row">
              <div className="layout-grid-4 list-search-main">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="card group space-y-3 flex flex-col"
                  >
                    <div
                      className="card overflow-hidden"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="item-card9-img"
                        style={{ height: "100%" }}
                      >
                        <div className="item-card9-imgs text-center">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDocumentClick(doc.id, doc.id_category);
                            }}
                          >
                            <img
                              height="100px"
                              src={doc.image}
                              alt={doc.title}
                              className="cover-image m-auto"
                            />
                          </a>
                        </div>
                      </div>
                      <div className="card border-0 mb-0 shadow-0 noradius">
                        <div className="card-body pl-2 pr-2 pt-2 pb-0">
                          <div className="item-card9">
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault(); // Ngăn điều hướng mặc định
                                handleDocumentClick(doc.id, doc.id_category);
                              }}
                            >
                              <p>{doc.title}</p>
                            </a>
                          </div>
                        </div>
                        <div
                          className="pl-2 pr-2 pt-0 pb-1 document-icon"
                          style={{ marginLeft: "20px", fontSize: "13px" }}
                        >
                          <span className="text-muted">
                            {/* <i className="fa fa-download mr-1"></i>Tải:{" "}
                            {doc.downloads} */}
                          </span>
                          <span className="text-muted">
                            <i className="fa fa-eye mr-1"></i>Xem: {doc.view}
                          </span>
                        </div>
                      </div>
                      <div className="card-footer p-lg-2">
                        <div className="item-card9-footer d-flex">
                          <div className="ml-auto">
                            <a
                              href="#"
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.preventDefault(); // Ngăn điều hướng mặc định
                                handleDocumentClick(doc.id, doc.id_category);
                              }}
                            >
                              Xem <i className="fa fa-arrow-right"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
  );
};

export default Search;
