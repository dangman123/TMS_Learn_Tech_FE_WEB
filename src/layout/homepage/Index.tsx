import React, { useEffect, useState } from "react";
import CoursesSlider from "../util/SliderCourse";
import WOW from "wowjs";
import DocumentList from "./component/DocumentList";
import { DocumentModel } from "../../model/DocumentModel";
import {
  GET_USER_DOCUMENT_CREATE_DESC,
  GET_USER_DOCUMENT_DOWNLOAD_DESC,
  GET_USER_DOCUMENT_VIEW_DESC,
} from "../../api/api";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import "./index.css";
function Index() {
  useEffect(() => {
    new WOW.WOW({
      live: false,
    }).init();
  }, []);

  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [documentsView, setDocumentsView] = useState<DocumentModel[]>([]);
  const [documentsCreate, setDocumentsCreate] = useState<DocumentModel[]>([]);
  // Fetch data from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(GET_USER_DOCUMENT_DOWNLOAD_DESC);
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    const fetchDocumentsView = async () => {
      try {
        const response = await fetch(GET_USER_DOCUMENT_VIEW_DESC);
        const data = await response.json();
        setDocumentsView(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    const fetchDocumentsCreate = async () => {
      try {
        const response = await fetch(GET_USER_DOCUMENT_CREATE_DESC);
        const data = await response.json();
        setDocumentsCreate(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
    fetchDocumentsView();
    fetchDocumentsCreate();
  }, []);

  return (
    <main>
      <section
        className="banner-area pt-190 pb-190 sub-bg bg-image paralax__animation"
        data-background="assets/images/bg/banner-shadow.png"
      >
        <div className="banner__shape1">
          <img src="assets/images/shape/banner-shape-left.png" alt="shape" />
        </div>
        <div className="banner__shape2">
          <img
            className="animation__arryUpDown"
            src="assets/images/shape/banner-earth.png"
            alt="shape"
          />
        </div>
        <div className="banner__shape3">
          <img
            className="slide-effect1"
            src="assets/images/shape/banner-circle.png"
            alt="shape"
          />
        </div>
        <div className="banner__shape4">
          <img
            className="sway__animationX"
            src="assets/images/shape/banner-line.png"
            alt="shape"
          />
        </div>
        <div className="banner__shape5">
          <img src="assets/images/shape/banner-shape-right.png" alt="shape" />
        </div>
        <div className="container">
          <div className="banner__content">
            <h1
              className="wow fadeInUp"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              Khóa học nâng cao
              <span className="primary-color">kĩ năng</span>
            </h1>
            <p
              className="mt-20 wow fadeInUp"
              data-wow-delay="400ms"
              data-wow-duration="1500ms"
            >
              Rèn luyện khả năng tự học thông qua những khóa học bổ trợ của
              chúng tôi !
            </p>
            <a
              href="/khoa-hoc"
              className="btn-one mt-50 wow fadeInUp"
              data-wow-delay="600ms"
              data-wow-duration="1500ms"
            >
              Truy cập khóa học<i className="fa-light fa-arrow-right-long"></i>
            </a>
          </div>
        </div>
        <div className="banner__hero">
          <div className="banner__info" data-depth="0.03">
            <img src="assets/images/icon/banner-hero-icon2.png" alt="icon" />
            <div>
              <h5 className="fs-28">
                <span className="count secondary-color">6,570</span>+
              </h5>
              <span className="fs-14">Lượng sinh viên</span>
            </div>
          </div>

          <img
            src="assets/images/banner/bannerHome.jpg"
            alt="image"
            width={"579px"}
            height={"760px"}
          />
          <img
            className="hero-shape1"
            src="assets/images/shape/banner-hero-line.png"
            alt="shape"
          />
          <img
            className="hero-shape2"
            src="assets/images/shape/banner-hero-shape.png"
            alt="shape"
          />
          <img
            className="hero-shape3"
            src="assets/images/shape/banner-hero-circle.png"
            alt="shape"
          />
          <img
            className="hero-shape4 sway_Y__animationY"
            src="assets/images/shape/banner-hero-dots.png"
            alt="shape"
          />
        </div>
      </section>

      <section className="about-area pt-120 pb-120">
        <div className="container">
          <div className="row g-4">
            <div
              className="col-xl-5 wow fadeInRight"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              <div className="about__left-part">
                <div className="about__image">
                  <img
                    className="about-dots sway__animation"
                    src="assets/images/shape/about-dots.png"
                    alt="shape"
                  />
                  <img
                    className="about-circle"
                    src="assets/images/shape/about-circle.png"
                    alt="shape"
                  />
                  <img src="../assets/images/about/about-1.jpg" alt="image" />
                  {/* <img
                    className="sm-image"
                    src="../assets/images/about/about3.jpg"
                    alt="image"
                  /> */}
                </div>
              </div>
            </div>
            <div className="col-xl-7">
              <div className="about__right-wrp">
                <div className="section-header home-page ">
                  <h5
                    className="wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    Tài liệu
                  </h5>
                  <h2
                    className="wow fadeInUp"
                    data-wow-delay="200ms"
                    data-wow-duration="1500ms"
                  >
                    Tổng hợp những đề thi
                    <span>
                      chất lượng nhất
                      <img
                        src="assets/images/shape/header-shape.png"
                        alt="shape"
                      />
                    </span>
                  </h2>
                  <p
                    className="wow fadeInUp"
                    data-wow-delay="00ms"
                    data-wow-duration="1500ms"
                  >
                    Toàn bộ tài liệu từ các cấp độ trung học phổ thông đến Đại
                    học cao đăng, hỗ trợ người học tìm kiếm những tài liệu hữu
                    ích.
                  </p>
                </div>
                <div
                  className="about__right-part mt-30 wow fadeInDown"
                  data-wow-delay="200ms"
                  data-wow-duration="1500ms"
                >
                  <div className="about__info">
                    <div className="icon bg__1">
                      <img
                        src="assets/images/icon/about-icon1.png"
                        alt="icon"
                      />
                    </div>
                    <div>
                      <h4>Hỗ trợ người học</h4>
                    </div>
                  </div>
                  <div className="about__info">
                    <div className="icon bg__2">
                      <img
                        src="assets/images/icon/about-icon2.png"
                        alt="icon"
                      />
                    </div>
                    <div>
                      <h4>Thoải mái truy cập</h4>
                    </div>
                  </div>
                </div>
                <a
                  href="/tai-lieu"
                  className="btn-one mt-50 wow fadeInDown"
                  data-wow-delay="200ms"
                  data-wow-duration="1500ms"
                >
                  Tài Liệu<i className="fa-light fa-arrow-right-long"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-area pt-120 pb-120 sub-bg">
        <div
          className="courses__line wow slideInLeft"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          <img src="assets/images/shape/courses-line.png" alt="line-shape" />
        </div>
        <div className="courses__shape">
          <img
            className="slide-up-down"
            src="assets/images/shape/courses-shape.png"
            alt="shape"
          />
        </div>
        <div className="container">
          <div style={{display:"block !important"}} className="section-header mb-60 text-center home-page">
            <h5
              className="wow fadeInUp"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              Khóa học
            </h5>
            <h2
              className="wow fadeInUp"
              data-wow-delay="200ms"
              data-wow-duration="1500ms"
            >
              Những khóa học
              <span>
                Phổ biến
                <img src="assets/images/shape/header-shape.png" alt="shape" />
              </span>
            </h2>
          </div>
          <div className="courses__wrp">
            <CoursesSlider />
          </div>
        </div>
      </section>

      <section className="about-area pt-120 pb-120 bg-white">
        <div className="container">
          <div className="section-header mb-60 text-center home-page ">
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
              <span>
                Tài Liệu
                <img src="assets/images/shape/header-shape.png" alt="shape" />
              </span>
            </h2>
          </div>
          <div className="row">
            <DocumentList documents={documents} title={"Tài liệu tải nhiều"} />
            <DocumentList
              documents={documentsView}
              title={"Tài liệu xem nhiều"}
            />
            <DocumentList
              documents={documentsCreate}
              title={"Tài liệu mới đăng"}
            />
          </div>
        </div>
      </section>
      <ToastContainer />
    </main>
  );
}
export default Index;
