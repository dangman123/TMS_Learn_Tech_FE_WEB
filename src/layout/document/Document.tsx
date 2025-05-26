import React, { useEffect, useState } from "react";
import DocumentSlide from "../util/SlideDocument";
import NavDocument from "./Components/Components/NavDocument";
import ListDocument from "./Components/Components/ListDocument";
import axios from "axios";
import {
  GET_USER_DOCUMENT_BY_CATEGORY_ID,
  GET_USER_DOCUMENT_PAGE,
} from "../../api/api";
import { DocumentModel } from "../../model/DocumentModel";
import "./styleDocument.css";
import { useParams } from "react-router-dom";

function Document() {
  let id = localStorage.getItem("iddanhmuctailieu");
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sortCriterion, setSortCriterion] = useState<
    "featured" | "most-viewed" | "newest"
  >("newest");
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const url = id
          ? GET_USER_DOCUMENT_BY_CATEGORY_ID(Number(id), currentPage, 12)
          : GET_USER_DOCUMENT_PAGE(currentPage, 12);

        const response = await axios.get(url);

        let convertedDocuments: DocumentModel[] = [];
        
        if (id) {
          // Xử lý dữ liệu từ API GET_USER_DOCUMENT_BY_CATEGORY_ID
          // Sửa lại để truy cập đúng cấu trúc dữ liệu: response.data.data.content
          const apiData = response.data.data ? response.data.data.content : response.data.content;

          if (!apiData || apiData.length === 0) {
            console.log("Không có dữ liệu từ API hoặc dữ liệu trống");
            setDocuments([]);
            setTotalPages(0);
            setLoading(false);
            return;
          }

          console.log("Dữ liệu API:", apiData);

          convertedDocuments = apiData.map((doc: any) => ({
            documentId: doc.id,
            documentTitle: doc.title,
            image_url: doc.fileUrl, // Sử dụng fileUrl làm ảnh mặc định
            fileUrl: doc.fileUrl,
            view: doc.view,
            created_at: doc.createdAt,
            download_count: doc.downloads || 0,
            id_category: doc.categoryId,
            categoryName: doc.categoryName,
            format: doc.format,
            size: doc.size,
            status: doc.status,
            description: doc.description
          }));

          // Cập nhật totalPages từ cấu trúc đúng của response
          setTotalPages(response.data.data ? response.data.data.totalPages : response.data.totalPages);
        } else {
          // Xử lý dữ liệu từ API GET_USER_DOCUMENT_PAGE (giữ nguyên format cũ)
          const apiData = response.data.content;
          convertedDocuments = apiData.map((doc: any[]) => ({
            documentId: doc[0],
            documentTitle: doc[1],
            image_url: doc[2],
            download_url: doc[3],
            view: doc[4],
            created_at: doc[5],
            download_count: doc[6],
            id_category: doc[7],
          }));
          
          setTotalPages(response.data.totalPages);
        }

        const sortedDocuments = convertedDocuments.sort(
          (a: DocumentModel, b: DocumentModel) => {
            switch (sortCriterion) {
              case "featured":
                // Sử dụng downloads nếu có, nếu không thì dùng download_count
                return (b.downloads || b.download_count) - (a.downloads || a.download_count);
              case "most-viewed":
                return b.view - a.view;
              case "newest":
                // Sử dụng createdAt nếu có, nếu không thì dùng created_at
                return (
                  new Date(b.createdAt || b.created_at).getTime() -
                  new Date(a.createdAt || a.created_at).getTime()
                );
              default:
                return 0;
            }
          }
        );

        setDocuments(sortedDocuments);
      } catch (error) {
        console.error("Lỗi khi tải tài liệu:", error);
        setDocuments([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, id, sortCriterion]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortChange = (
    criterion: "featured" | "most-viewed" | "newest"
  ) => {
    setSortCriterion(criterion);
    setCurrentPage(0);
  };

  return (
    <main>
      <section className="sptb-document">
        <div className="container">
          <div className="row">
            <NavDocument />
            <div className="col-xl-9 col-lg-8 col-md-12 mb-3">
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
              ) : documents.length > 0 ? (
                <>
                  <ListDocument documents={documents} />
                  {totalPages > 0 && (
                    <div className="pegi justify-content-center mt-60 pb-30">
                      <button
                        className="border-none"
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <i className="fa-regular fa-arrow-left primary-color transition"></i>
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={currentPage === index ? "active" : ""}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        className="border-none"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <i className="fa-regular fa-arrow-right primary-color transition"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-documents">
                  <div className="no-data-icon">
                    <i className="fa fa-file-text-o" aria-hidden="true"></i>
                  </div>
                  <h3>Không có tài liệu</h3>
                  <p>Hiện chưa có tài liệu nào trong danh mục này.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Document;
