import React from "react";

function Footer() {
  const styleIMG = {
    width: "160px",
    height: "160px",
  };
  return (
    <footer className="footer-area  bg-white">
      <div className="footer__shape-left">
        <img
          src="../../assets/images/shape/footer-shape-left.png"
          alt="shape"
        />
      </div>
      <div className="footer__shape-right sway_Y__animationY">
        <img
          src="../../assets/images/shape/footer-shape-right.png"
          alt="shape"
        />
      </div>
      <div className="container">
        <div className="footer__wrp pt-100 pb-100">
          <div
            className="footer__item footer-about wow fadeInUp"
            data-wow-delay="00ms"
            data-wow-duration="1500ms"
          >
            <a href="/" className="logo mb-30">
              <img src="../../assets/images/logo/logo.svg" alt="logo" />
            </a>
            <p>
              Chào mừng bạn đến với T-M-S, nền tảng hỗ trợ học tập toàn diện
              giúp bạn tiếp cận kiến thức một cách hiệu quả và dễ dàng thông qua
              các bài giảng, video hướng dẫn, và tài liệu phong phú. Hãy cùng
              chúng tôi nâng cao tri thức và chinh phục mọi thử thách trong học
              tập!
            </p>
            <ul className="mt-25">
              <li>
                <svg
                  className="me-1"
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.99991 0C3.92603 0 0.611816 3.31421 0.611816 7.38809C0.611816 8.72925 1.21329 10.1717 1.2385 10.2325C1.43276 10.6936 1.81608 11.4098 2.09248 11.8296L7.1581 19.505C7.3654 19.8196 7.67222 20 7.99991 20C8.32759 20 8.63442 19.8196 8.84172 19.5054L13.9078 11.8296C14.1846 11.4098 14.5675 10.6936 14.7618 10.2325C14.787 10.1721 15.388 8.72968 15.388 7.38809C15.388 3.31421 12.0738 0 7.99991 0ZM13.9604 9.89526C13.787 10.3086 13.4302 10.9748 13.182 11.3512L8.11594 19.0269C8.01599 19.1786 7.98426 19.1786 7.88431 19.0269L2.81825 11.3512C2.5701 10.9748 2.21329 10.3081 2.03989 9.89483C2.0325 9.87701 1.481 8.54933 1.481 7.38809C1.481 3.79357 4.40538 0.869187 7.99991 0.869187C11.5944 0.869187 14.5188 3.79357 14.5188 7.38809C14.5188 8.55106 13.966 9.88223 13.9604 9.89526Z"
                    fill="#2EB97E"
                  />
                  <path
                    d="M7.99972 3.47754C5.84283 3.47754 4.08838 5.23243 4.08838 7.38888C4.08838 9.54534 5.84283 11.3002 7.99972 11.3002C10.1566 11.3002 11.9111 9.54534 11.9111 7.38888C11.9111 5.23243 10.1566 3.47754 7.99972 3.47754ZM7.99972 10.431C6.32262 10.431 4.95757 9.06641 4.95757 7.38888C4.95757 5.71135 6.32262 4.34673 7.99972 4.34673C9.67682 4.34673 11.0419 5.71135 11.0419 7.38888C11.0419 9.06641 9.67682 10.431 7.99972 10.431Z"
                    fill="#2EB97E"
                  />
                </svg>
                <a href="#0" className="p-0">
                  140 Lê Trọng Tấn
                </a>
              </li>
              <li>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7719 14.1213C18.7388 14.0938 14.9913 11.4275 13.9794 11.5906C13.4913 11.6769 13.2125 12.01 12.6531 12.6762C12.4985 12.8617 12.3403 13.0443 12.1788 13.2238C11.8252 13.1086 11.4804 12.9682 11.1469 12.8038C9.42533 11.9656 8.03437 10.5747 7.19625 8.85312C7.03179 8.51964 6.89143 8.1748 6.77625 7.82125C6.96 7.65312 7.2175 7.43625 7.3275 7.34375C7.99062 6.7875 8.32312 6.50812 8.40938 6.01937C8.58625 5.0075 5.90625 1.26125 5.87875 1.2275C5.7567 1.05441 5.59775 0.910578 5.41336 0.806386C5.22897 0.702193 5.02374 0.640241 4.8125 0.625C3.72625 0.625 0.625 4.6475 0.625 5.32562C0.625 5.365 0.681875 9.3675 5.6175 14.3881C10.6325 19.3181 14.635 19.375 14.6744 19.375C15.3519 19.375 19.375 16.2737 19.375 15.1875C19.3596 14.9762 19.2975 14.771 19.1932 14.5866C19.0889 14.4022 18.945 14.2433 18.7719 14.1213ZM14.605 18.1213C14.0625 18.075 10.7 17.6319 6.5 13.5063C2.35437 9.28563 1.9225 5.9175 1.87937 5.39563C2.69861 4.10978 3.68799 2.94064 4.82062 1.92C4.84562 1.945 4.87875 1.9825 4.92125 2.03125C5.78989 3.21702 6.53817 4.48642 7.155 5.82062C6.95441 6.02242 6.7424 6.21253 6.52 6.39C6.17512 6.65278 5.85843 6.95063 5.575 7.27875C5.52704 7.34604 5.4929 7.42217 5.47456 7.50274C5.45621 7.5833 5.45403 7.66671 5.46812 7.74813C5.60039 8.32108 5.80297 8.87549 6.07125 9.39875C7.03243 11.3725 8.62735 12.9672 10.6012 13.9281C11.1244 14.1968 11.6788 14.3996 12.2519 14.5319C12.3333 14.5463 12.4168 14.5443 12.4974 14.5259C12.578 14.5075 12.6541 14.4732 12.7213 14.425C13.0505 14.1404 13.3494 13.8225 13.6131 13.4762C13.8094 13.2425 14.0712 12.9306 14.1706 12.8425C15.5082 13.4587 16.7805 14.2079 17.9681 15.0787C18.02 15.1225 18.0569 15.1562 18.0812 15.1781C17.0606 16.3111 15.8912 17.3007 14.605 18.12V18.1213ZM14.375 9.375H15.625C15.6235 8.04937 15.0962 6.77847 14.1589 5.84111C13.2215 4.90375 11.9506 4.37649 10.625 4.375V5.625C11.6193 5.62599 12.5725 6.0214 13.2756 6.72445C13.9786 7.42749 14.374 8.38074 14.375 9.375Z"
                    fill="#2EB97E"
                  />
                </svg>
                <a href="tel:+2086660112" className="p-0">
                  0123-456-789
                </a>
              </li>
            </ul>
          </div>
          <div
            className="footer__item item-sm wow fadeInUp"
            data-wow-delay="200ms"
            data-wow-duration="1500ms"
          >
            <h3 className="footer-title">Truy cập nhanh</h3>
            <ul>
              <li>
                <a href="/tai-lieu">
                  <i className="fa-regular fa-angles-right me-1"></i> Tài liệu
                </a>
              </li>
              <li>
                <a href="/khoa-hoc">
                  <i className="fa-regular fa-angles-right me-1"></i> Khóa học
                </a>
              </li>
              {/* <li>
                <a href="team.html">
                  <i className="fa-regular fa-angles-right me-1"></i> Trắc
                  nghiệm
                </a>
              </li> */}
              <li>
                <a href="/tai-khoan">
                  <i className="fa-regular fa-angles-right me-1"></i> Tài khoản
                </a>
              </li>
              <li>
                <a href="/bai-viet">
                  <i className="fa-regular fa-angles-right me-1"></i> Bài viết
                </a>
              </li>
              <li>
                <a href="/tai-khoan/history-pay">
                  <i className="fa-regular fa-angles-right me-1"></i> Lịch sử
                  thanh toán
                </a>
              </li>
            </ul>
          </div>
          <div
            className="footer__item item-sm wow fadeInUp"
            data-wow-delay="400ms"
            data-wow-duration="1500ms"
          >
            <h3 className="footer-title">Liên lạc hỗ trợ</h3>
            <ul>
              <li>
                <a href="mailto:hotrokhotrithucso@gmail.com" rel="nofollow">
                  <i className="fa fa-envelope mr-3 text-primary"></i>{" "}
                  <b>tms@gmail.com</b>
                </a>
              </li>
              <li>
                <a href="tel:0396668157" rel="nofollow">
                  <i className="fa fa-phone mr-3 text-primary"></i>{" "}
                  <b>0396668157</b>
                </a>
              </li>
            </ul>
            <div>
              <img
                src="../../assets/images/zalo-qr-code.jpg"
                style={styleIMG}
                alt="Mã ZALO QR Code hỗ trợ"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="footer__copyright">
        <div className="container">
          <div className="d-flex gap-1 flex-wrap align-items-center justify-content-md-between justify-content-center">
            <p
              className="wow fadeInDown"
              data-wow-delay="00ms"
              data-wow-duration="1500ms"
            >
              &copy; All Copyright 2024 by
              <a href="#0" className="primary-color">
                T-M-S
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
