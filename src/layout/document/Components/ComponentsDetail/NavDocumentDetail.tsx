import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styleDocument.css";

interface DocumentRelated {
  id: number;
  title: string;
  downloadCount: number;
  viewCount: number;
}

interface NavDocumentDetailProps {
  idCategory: number;
}
const NavDocumentDetail: React.FC<NavDocumentDetailProps> = ({
  idCategory,
}) => {
  const [relatedDocuments, setRelatedDocuments] = useState<DocumentRelated[]>(
    []
  );
  const handleDocumentClick = async (docId: any) => {
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
        window.location.href = (`/tai-lieu/${danhmuctailieu}/${docId}`);
      } else {
        console.error("Failed to increment view count");
      }
    } catch (error) {
      console.error("Error incrementing view count", error);
    }
  };

  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/category/${idCategory}`
        );
        const documents: DocumentRelated[] = response.data.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          downloadCount: doc.totalDownload, // Điều chỉnh tên trường cho đúng với API trả về
          viewCount: doc.totalView, // Điều chỉnh tên trường cho đúng với API trả về
        }));
        setRelatedDocuments(documents);
      } catch (error) {
        console.error("Error fetching related documents:", error);
      }
    };

    if (idCategory) {
      fetchRelatedDocuments();
    }
  }, [idCategory]);
  const navigate = useNavigate();
  return (
    <div className="col-xl-3 col-lg-4 col-md-12 bg-white p-4">
      <div className="card mb-1">
        <p className="heading card">
          <b>TÀI LIỆU LIÊN QUAN</b>
        </p>
        <ul className="heading-document space-y-4 overflow-visible">
          {relatedDocuments.map((doc) => (
            <li key={doc.id} className="nav-document-detail">
              <div className="card-body pl-2 pr-2 pt-2 pb-0">
                <div className="item-card9">
                  <a
                    href="#"
                    className="text-dark"
                    title={doc.title}
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn hành vi mặc định của thẻ `<a>`
                      handleDocumentClick(doc.id);
                    }}
                  >
                    <p>{doc.title}</p>
                  </a>
                </div>
              </div>
              <div className="pl-2 pr-2 pt-0 pb-1">
                <span className="text-muted" style={{ marginLeft: "20px" }}>
                  <i className="fa fa-download mr-1"></i>Tải:{" "}
                  {doc.downloadCount}
                </span>
                <span className="text-muted" style={{ marginLeft: "20px" }}>
                  <i className="fa fa-eye mr-1"></i>Xem: {doc.viewCount}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavDocumentDetail;
