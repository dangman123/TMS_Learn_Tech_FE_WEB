import React from "react";
import "./style.css";
export const PaymentFail = () => {
  return (
    <section className="payment-failure-area pt-120 pb-120 text-center">
      <div className="container">
        <div className="payment-failure-content">
          {/* Icon thất bại */}
          <div className="failure-icon">
            <i
              className="fa fa-exclamation-circle text-danger"
              style={{ fontSize: "72px" }}
            ></i>
          </div>

          {/* Tiêu đề thất bại */}
          <h2 className="mt-4">Thanh toán thất bại</h2>

          {/* Mô tả ngắn về lỗi */}
          <p className="text-muted">
            Có sự cố xảy ra khi xử lý thanh toán của bạn. Vui lòng thử lại hoặc
            liên hệ hỗ trợ.
          </p>

          {/* Lựa chọn hành động tiếp theo */}
          <div className="actions mt-5">
            {/* <button className="btn btn-primary btn-lg mx-2">
              <a href={`/khoa-hoc/thanh-toan`}>Thử lại thanh toán</a>
            </button> */}
            <button className="btn btn-secondary btn-lg mx-2">
              <a href={`/gio-hang`}>Quay lại giỏ hàng</a>
            </button>
          </div>

          {/* Nút quay lại trang chủ */}
          <div className="back-to-home mt-4">
            <a href="/" className="btn btn-link">
              <i className="fa fa-arrow-left"></i> Trở về trang chủ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
