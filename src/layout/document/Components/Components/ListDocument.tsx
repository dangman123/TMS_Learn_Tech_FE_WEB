import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DocumentModel } from "../../../../model/DocumentModel";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import axios from "axios";

// Thiết lập đường dẫn đến worker từ thư mục công cộng
GlobalWorkerOptions.workerSrc = "/pdfjs-dist/build/pdf.worker.min.mjs";
interface ListDocumentProps {
  documents: DocumentModel[];
}
type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const ListDocument: React.FC<ListDocumentProps> = ({ documents }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const handleDocumentClick = async (docId: any, idDanhMuc: any) => {
    categories.forEach((categorie) => {
      if (categorie.id === idDanhMuc) {
        localStorage.setItem(
          "danhmuctailieu",
          removeVietnameseTones(categorie.name)
        );
      }
    });

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
          `${process.env.REACT_APP_SERVER_HOST}/categories-all`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  return (
    <div id="listDocProductCat" className="row">
      <div className="layout-grid-4">
        {documents.map((doc) => {
          // Lấy URL ảnh từ các nguồn khác nhau (tương thích với cả hai API)
          const imageUrl = doc.image_url || doc.fileUrl || "";
          // Lấy số lượt tải từ các nguồn khác nhau
          const downloadCount = doc.download_count !== undefined ? doc.download_count : (doc.downloads || 0);
          // Lấy ID danh mục
          const categoryId = doc.id_category !== undefined ? doc.id_category : (doc.categoryId || 0);
          
          return (
            <div
              key={doc.documentId}
              className="card group space-y-3 flex flex-col"
            >
              <div className="card overflow-hidden">
                <div className="item-card9-img">
                  <div className="item-card9-imgs text-center">
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault(); // Ngăn điều hướng mặc định
                        handleDocumentClick(doc.documentId, categoryId); // Sử dụng categoryId đã xử lý
                      }}
                    >
                      <img
                        height="100px"
                        src={imageUrl}
                        alt={doc.documentTitle}
                        className="cover-image m-auto"
                      />
                    </Link>
                  </div>
                </div>
                <div
                  className="card border-0 mb-0 shadow-0 noradius"
                  style={{ height: "100px" }}
                >
                  <div className="card-body pl-2 pr-2 pt-2 pb-0">
                    <div className="item-card9">
                      <Link
                        to="#"
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn điều hướng mặc định
                          handleDocumentClick(doc.documentId, categoryId);
                        }}
                      >
                        <a
                          href="#"
                          className="text-dark"
                          title={doc.documentTitle}
                        >
                          <p>
                            {doc.documentTitle.length > 40
                              ? `${doc.documentTitle.substring(0, 40)}...`
                              : doc.documentTitle}
                          </p>
                        </a>
                      </Link>
                    </div>
                  </div>
                  <div
                    className="pl-2 pr-2 pt-0 pb-1 document-icon"
                    style={{ marginLeft: "20px", fontSize: "13px" }}
                  >
                    <span className="text-muted">
                      <i className="fa fa-download mr-1"></i>Tải:{" "}
                      {downloadCount.toLocaleString()}
                    </span>
                    <span className="text-muted">
                      <i className="fa fa-eye mr-1"></i>Xem:{" "}
                      {doc.view ? doc.view.toLocaleString() : "0"}
                    </span>
                  </div>
                </div>
                <div className="card-footer p-lg-2">
                  <div className="item-card9-footer d-flex">
                    <div className="ml-auto">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn điều hướng mặc định
                          handleDocumentClick(doc.documentId, categoryId);
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? "Đang cập nhật..." : "Xem"}{" "}
                        <i className="fa fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListDocument;
