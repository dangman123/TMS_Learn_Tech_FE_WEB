import React from "react";

function NavExampleDetail() {
  return (
    <div className="col-md-4 col-xs-12">
      <div className="card">
        <div className="card-body">
          <p className="text-justify">
            Các bài trắc nghiệm của bạn đều đc hệ thống lưu vào. Để xem lịch sử
            đã làm vui lòng click bên dưới.
          </p>
        </div>
        <div className="card-footer">
          <a
            href="#"
            className="btn btn-block btn-lg btn-outline-primary"
            target="_blank"
          >
            <i className="fa fa-arrow-circle-o-right"></i> Click xem lịch sử làm
            trắc nghiệm
          </a>
        </div>
      </div>

      <div id="suggest-top-quiz-box">
        <div className="card">
          <div className="card-header header-elements-inline bg-white p-2">
            <h3
              id="topQuizSuggestTitle"
              style={{ fontSize: "18px !important" }}
              className="font-weight-bolder"
            >
              Trắc nghiệm gần giống Đề kiểm tra môn Đại số lớp 10 Chương 1 Mệnh
              đề và Tập hợp
            </h3>
          </div>
          <div className="card-body p-4">
            <div id="listSuggestTopQuiz" className="row">
              <div className="col-lg-12 col-md-12 col-sm-6 col-6">
                <div className="card overflow-hidden">
                  <div className="d-md-flex">
                    <div className="item-card9-img">
                      <div className="item-card9-imgs text-center">
                        <a href="#"></a>
                        <img
                          style={{
                            width: "109px !important",
                            height: "142px !important",
                            maxWidth: "none !important",
                          }}
                          src="./BaiLamTracNghiem/180x300.png"
                          alt="Đề kiểm tra môn Đại số lớp 10 Chương 1 Mệnh đề và Tập hợp"
                          className="cover-image m-auto"
                        />
                      </div>
                    </div>
                    <div
                      className="card border-0 mb-0 shadow-0 noradius"
                      style={{ borderRadius: "unset" }}
                    >
                      <div className="card-body pl-2 pr-2 pt-2 pb-0">
                        <div className="item-card9">
                          <a
                            href="#"
                            className="text-dark"
                          >
                            <span>
                              Đề kiểm tra môn Đại số lớp 10 Chương 1 Mệnh đề và
                              Tập hợp
                            </span>
                          </a>
                        </div>
                      </div>
                      <div className="pl-2 pr-2 pt-0 pb-1">
                        <span
                          className="text-muted mr-4"
                          style={{
                            fontSize: "10px",
                            lineHeight: "12px !important",
                          }}
                        >
                          <i className="fa fa-qrcode mr-2"></i>Mã:
                          <b className="text-dark">11008842</b>
                        </span>
                        <br />
                        <span
                          className="text-muted mr-4"
                          style={{
                            fontSize: "10px",
                            lineHeight: "12px !important",
                          }}
                        >
                          <i className="fa fa-check-circle-o mr-2"></i>
                          Test: 01
                        </span>
                        <br />
                        <span
                          className="text-muted mr-4"
                          style={{
                            fontSize: "10px",
                            lineHeight: "12px !important",
                          }}
                        >
                          <i className="fa fa-eye mr-2"></i>Xem:03
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer p-lg-2">
                    <div className="item-card9-footer d-flex">
                      <div className="ml-auto">
                        <a
                          href="#"
                          className="btn btn-primary btn-sm"
                        >
                          Xem <i className="fa fa-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script id="template-list-suggest-top-quiz" type="text/x-tmpl">
        <div className="col-lg-12 col-md-12 col-sm-6 col-6">
          <div className="card overflow-hidden">
            <div className="d-md-flex">
              <div className="item-card9-img">
                <div className="item-card9-imgs text-center">
                  <a href="${Url}"></a>
                  <img
                    style={{
                      width: "109px !important",
                      height: "142px !important",
                      maxWidth: "none !important",
                    }}
                    src="${Thumbnail}"
                    alt="${Title}"
                    className="cover-image m-auto"
                  ></img>
                </div>
              </div>
              <div
                className="card border-0 mb-0 shadow-0 noradius"
                style={{ borderRadius: "unset" }}
              >
                <div className="card-body pl-2 pr-2 pt-2 pb-0">
                  <div className="item-card9">
                    <a href="${Url}" className="text-dark">
                      <span>Tiêu đề</span>
                    </a>
                  </div>
                </div>
                <div className="pl-2 pr-2 pt-0 pb-1">
                  <span
                    className="text-muted mr-4"
                    style={{
                      fontSize: "10px",
                      lineHeight: "12px !important",
                    }}
                  >
                    <i className="fa fa-qrcode mr-2"></i>Mã:{" "}
                    <b className="text-dark">1111111</b>
                  </span>
                  <br />
                  <span
                    className="text-muted mr-4"
                    style={{
                      fontSize: "10px",
                      lineHeight: "12px !important",
                    }}
                  >
                    <i className="fa fa-check-circle-o mr-2"></i>Test: 111111
                  </span>
                  <br />
                  <span
                    className="text-muted mr-4"
                    style={{
                      fontSize: "10px",
                      lineHeight: "12px !important",
                    }}
                  >
                    <i className="fa fa-eye mr-2"></i>Xem:111111
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </script>
    </div>
  );
}
export default NavExampleDetail;
