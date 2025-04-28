import React from "react";
import "./Upgrade.css";

const Upgrade = () => {
  return (
    <div className="upgrade-container">
      <h1 className="upgrade-title">Nâng cấp gói học của bạn</h1>
      <div className="plan-container">
        {/* Gói Cơ Bản */}
        <div className="plan-card">
          <h2 className="plan-title">Gói Cơ Bản</h2>
          <p className="plan-price">
            0 <span>USD/tháng</span>
          </p>
          <p className="plan-description">
            Phù hợp với sinh viên IT. Truy cập miễn phí vào các khóa học cơ bản
            và tài liệu học tập.
          </p>
          <button className="plan-button disabled">Gói hiện tại của bạn</button>
          <ul className="plan-features">
            <li>✔ Truy cập các khóa học cơ bản</li>
            <li>✔ Hỗ trợ qua email</li>
            <li>✔ Không có chứng chỉ hoàn thành</li>
          </ul>
        </div>

        {/* Gói 6 Tháng */}
        <div className="plan-card popular">
          <h2 className="plan-title">
            Gói 6 Tháng <span className="text-teal-300">ƯU ĐÃI</span>
          </h2>
          <p className="plan-price">
            100 <span>USD/6 tháng</span>
          </p>
          <p className="plan-description">
            Tiết kiệm 10% khi đăng ký gói 6 tháng. Truy cập đầy đủ các khóa học
            nâng cao.
          </p>
          <button className="plan-button teal">Chọn gói 6 tháng</button>
          <ul className="plan-features">
            <li>✔ Truy cập tất cả các khóa học</li>
            <li>✔ Hỗ trợ trực tiếp qua chat</li>
            <li>✔ Chứng chỉ hoàn thành khóa học</li>
            <li>✔ Ưu tiên tham gia các sự kiện trực tuyến</li>
          </ul>
        </div>

        {/* Gói 1 Năm */}
        <div className="plan-card">
          <h2 className="plan-title">Gói 1 Năm</h2>
          <p className="plan-price">
            180 <span>USD/năm</span>
          </p>
          <p className="plan-description">
            Tiết kiệm 25% khi đăng ký gói 1 năm. Truy cập không giới hạn và nhận
            nhiều ưu đãi đặc biệt.
          </p>
          <button className="plan-button white">Chọn gói 1 năm</button>
          <ul className="plan-features">
            <li>✔ Mọi tính năng trong gói 6 tháng</li>
            <li>✔ Ưu tiên hỗ trợ 24/7</li>
            <li>✔ Tham gia miễn phí các hội thảo trực tuyến</li>
            <li>✔ Giảm giá 20% cho các khóa học đặc biệt</li>
          </ul>
        </div>
      </div>

      <p className="footer-text">
        Không chắc chắn? Hãy thử gói miễn phí trước khi nâng cấp. Tìm hiểu thêm.
      </p>
      <p className="footer-text">Các gói có thể được gia hạn tự động.</p>
    </div>
  );
};

export default Upgrade;
