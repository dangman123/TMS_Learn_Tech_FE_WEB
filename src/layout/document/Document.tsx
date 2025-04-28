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
import "./styleDocument.css"; // Đảm bảo bạn có các lớp CSS cần thiết ở đây
import { useParams } from "react-router-dom";

function Document() {
  let id = localStorage.getItem("iddanhmuctailieu");
  // const { id } = useParams();
  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortCriterion, setSortCriterion] = useState<
    "featured" | "most-viewed" | "newest"
  >("newest");

  const url = id
    ? GET_USER_DOCUMENT_BY_CATEGORY_ID(Number(id), currentPage, 12)
    : GET_USER_DOCUMENT_PAGE(currentPage, 12);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const url = id
          ? GET_USER_DOCUMENT_BY_CATEGORY_ID(Number(id), currentPage, 12)
          : GET_USER_DOCUMENT_PAGE(currentPage, 12);

        const response = await axios.get(url);

        const convertedDocuments = response.data.content.map((doc: any[]) => ({
          documentId: doc[0],
          documentTitle: doc[1],
          image_url: doc[2],
          download_url: doc[3],
          view: doc[4],
          created_at: doc[5],
          download_count: doc[6],
          id_category: doc[7],
        }));

        const sortedDocuments = convertedDocuments.sort(
          (a: DocumentModel, b: DocumentModel) => {
            switch (sortCriterion) {
              case "featured":
                return b.download_count - a.download_count;
              case "most-viewed":
                return b.view - a.view;
              case "newest":
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              default:
                return 0;
            }
          }
        );

        setDocuments(sortedDocuments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching documents:", error);
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
    setCurrentPage(0); // Đặt lại trang hiện tại khi thay đổi tiêu chí phân loại
  };

  return (
    <main>
      <section className="sptb document">
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
              <ListDocument documents={documents} />
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
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}

export default Document;
