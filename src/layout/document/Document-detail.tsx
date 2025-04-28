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
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            const documentData = {
              id: data[0][0],
              createdAt: data[0][1],
              description: data[0][2],
              thumbnailUrl: data[0][3],
              title: data[0][4],
              updatedAt: data[0][5],
              url: data[0][6],
              views: data[0][7],
              id_category: data[0][8],
            };
            setTimeout(() => {
              setDocument(documentData);
              setLoading(false); // Stop loading after 2 seconds
            }, 2000);
          }
        } catch (error) {
          console.error("Error fetching document details:", error);
        } finally {
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
              <NavDocumentDetail idCategory={document.id_category} />
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
