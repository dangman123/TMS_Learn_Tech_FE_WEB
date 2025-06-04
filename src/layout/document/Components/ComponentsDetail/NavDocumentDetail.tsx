import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styleDocument.css";
import styles from "./NavDocumentDetail.module.css";
import "./sticky-helper.css"; // Import sticky helper CSS

interface DocumentRelated {
  id: number;
  title: string;
  downloadCount: number;
  viewCount: number;
}

interface NavDocumentDetailProps {
  idCategory: number;
  currentDocumentId: number;
}

const NavDocumentDetail: React.FC<NavDocumentDetailProps> = ({
  idCategory,
  currentDocumentId,
}) => {
  const [relatedDocuments, setRelatedDocuments] = useState<DocumentRelated[]>([]);
  const navigate = useNavigate();

  // Ensure sticky behavior by enforcing styles
  useEffect(() => {
    // Add a class to the document body to ensure proper scrolling context
    document.body.classList.add('has-sticky-sidebar');
    
    // Add a style tag to ensure the parent container has proper height
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .col-xl-3, .col-lg-4, .col-md-12 {
        min-height: 100vh;
      }
    `;
    document.head.appendChild(styleTag);
    
    return () => {
      document.body.classList.remove('has-sticky-sidebar');
      document.head.removeChild(styleTag);
    };
  }, []);

  const handleDocumentClick = async (docId: number) => {
    try {
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
        const danhmuctailieu = localStorage.getItem("danhmuctailieu");
        window.location.href = `/tai-lieu/${danhmuctailieu}/${docId}`;
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
        const documents: DocumentRelated[] = response.data
          .filter((doc: any) => doc.id !== currentDocumentId)
          .map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            downloadCount: doc.totalDownload,
            viewCount: doc.totalView,
          }));
        setRelatedDocuments(documents);
      } catch (error) {
        console.error("Error fetching related documents:", error);
      }
    };

    if (idCategory) {
      fetchRelatedDocuments();
    }
  }, [idCategory, currentDocumentId]);
  
  return (
    <aside 
      className={`col-xl-3 col-lg-4 col-md-12 ${styles.container}`}
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      <div 
        className={styles.relatedDocumentsContainer}
        style={{ position: 'sticky', top: '120px', zIndex: 10 }}
      >
        <div className={styles.card}>
          <div className={styles.headingCard}>
            <b>TÀI LIỆU LIÊN QUAN</b>
          </div>
          {relatedDocuments.length > 0 ? (
            <ul className={styles.headingDocument}>
              {relatedDocuments.map((doc) => (
                <li key={doc.id} className={styles.navDocumentDetail}>
                  <div className={styles.cardBody}>
                    <div>
                      <a
                        href="#"
                        className={styles.documentLink}
                        title={doc.title}
                        onClick={(e) => {
                          e.preventDefault();
                          handleDocumentClick(doc.id);
                        }}
                      >
                        <p>{doc.title}</p>
                      </a>
                    </div>
                  </div>
                  <div className={styles.stats}>
                    <span className={`${styles.textMuted} ${styles.statItem}`}>
                      <i className="fa fa-download mr-1"></i>Tải: {doc.downloadCount}
                    </span>
                    <span className={`${styles.textMuted} ${styles.statItem}`}>
                      <i className="fa fa-eye mr-1"></i>Xem: {doc.viewCount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noDocuments}>
              Không có tài liệu liên quan
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default NavDocumentDetail;
