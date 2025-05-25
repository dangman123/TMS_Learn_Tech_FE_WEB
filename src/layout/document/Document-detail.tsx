import React, { useEffect, useState } from "react";
import NavDocumentDetail from "./Components/ComponentsDetail/NavDocumentDetail";
import ContentDocumentDetail from "./Components/ComponentsDetail/ContentDocumentDetail";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import DocumentSlide from "../util/SlideDocument";

function Document_Detail() {
  const { id } = useParams<{ id?: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDocument = async () => {
      if (id) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${id}`
          );
          
          // Lấy dữ liệu từ response.data.data
          if (response.data && response.data.data) {
            const documentData = {
              id: response.data.data.id,
              createdAt: response.data.data.createdAt,
              description: response.data.data.description,
              thumbnailUrl: response.data.data.fileUrl, // Sử dụng fileUrl từ API
              title: response.data.data.title,
              updatedAt: response.data.data.updatedAt,
              url: response.data.data.fileUrl, // Sử dụng fileUrl từ API
              views: response.data.data.view, // Sử dụng view từ API
              id_category: response.data.data.categoryId, // Sử dụng categoryId từ API
            };
            setTimeout(() => {
              setDocument(documentData);
              setLoading(false);
            }, 1000);
          } else {
            console.error("Dữ liệu tài liệu không đúng định dạng:", response.data);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching document details:", error);
          setLoading(false);
        }
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  // const documentId = id ? parseInt(id, 10) : undefined;

  return (
    <section className="sptb sub-bg">
      <div className="container">
        <div className="row section-title center-block">
          {document && (
            <>
              <ContentDocumentDetail document={document} />
              <NavDocumentDetail 
                idCategory={document.id_category} 
                currentDocumentId={document.id}
              />
            </>
          )}
        </div>
        {/* <section className="testimonial-two-area pt-120 pb-120 sub-bg">
        <div className="testimonial-two__wrp m-auto p-3 container">
          <div className="row">
            <div className="section-header mb-60 text-center">
              <h5
                className="wow fadeInUp"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
              >
                Tài Liệu
              </h5>
              <h2
                className="wow fadeInUp"
                data-wow-delay="200ms"
                data-wow-duration="1500ms"
              >
                Tài Liệu Liên Quan
              </h2>
            </div>
            <div className="col-xxl-12">
              <div className="swiper testimonial-two__slider shadow radius8">
                <div className="swiper-wrapper">
                  <DocumentSlide />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      </div>
    </section>
  );
}
export default Document_Detail;
