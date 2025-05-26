import React, { useState } from "react";
import { toast } from "react-toastify";
import "./Contact.css";
// Thêm các interfaces
interface FAQItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}

interface GuideItem {
  title: string;
  content: string;
}

interface GuideCategory {
  title: string;
  guides: GuideItem[];
}

// Thêm vào function Contacts() trước phần return
function Contacts() {
  // State cho FAQ items
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      question: "Làm thế nào để đặt lại mật khẩu?",
      answer:
        'Để đặt lại mật khẩu, bạn có thể nhấn vào tùy chọn "Quên mật khẩu" trên màn hình đăng nhập. Sau đó, làm theo hướng dẫn để đặt lại mật khẩu thông qua email đã đăng ký.',
      isExpanded: false,
    },
    {
      question: "Làm cách nào để liên hệ với đội ngũ hỗ trợ?",
      answer:
        "Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi qua email tms.huit@gmail.com hoặc gọi số hotline 0348 740 942. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.",
      isExpanded: false,
    },
    {
      question: "Tôi không thể truy cập vào khóa học đã mua, phải làm sao?",
      answer:
        "Nếu bạn không thể truy cập vào khóa học đã mua, hãy thử đăng xuất và đăng nhập lại. Nếu vấn đề vẫn tiếp diễn, kiểm tra kết nối internet của bạn hoặc liên hệ với bộ phận hỗ trợ kỹ thuật để được giúp đỡ.",
      isExpanded: false,
    },
    {
      question: "Chứng chỉ khóa học có giá trị pháp lý không?",
      answer:
        "Chứng chỉ hoàn thành khóa học của chúng tôi được công nhận bởi nhiều đối tác doanh nghiệp và tổ chức giáo dục. Tuy nhiên, tùy thuộc vào từng ngành nghề, giá trị pháp lý có thể khác nhau. Vui lòng kiểm tra thông tin chi tiết của từng khóa học.",
      isExpanded: false,
    },
  ]);

  // Replace activeGuide with a simple modal visibility state
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Function để toggle FAQ
  const toggleFaq = (index: number) => {
    const updatedFaqItems = [...faqItems];
    updatedFaqItems[index].isExpanded = !updatedFaqItems[index].isExpanded;
    setFaqItems(updatedFaqItems);
  };

  // Function để mở modal hướng dẫn
  const openGuideModal = () => {
    setShowGuideModal(true);
  };

  // Function để đóng modal
  const closeGuideModal = () => {
    setShowGuideModal(false);
  };

  // Thêm function để đóng modal khi click bên ngoài
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ đóng khi click vào backdrop, không đóng khi click vào nội dung modal
    if (e.target === e.currentTarget) {
      closeGuideModal();
    }
  };

  // Function để gửi email feedback
  const sendFeedback = () => {
    const email = "tms.huit@gmail.com";
    const subject = "Phản hồi từ website TMS Learn Tech";
    const body = `Kính gửi Đội ngũ Hỗ trợ TMS Learn Tech,\n\nTôi muốn gửi phản hồi về website:\n\n[Vui lòng nhập nội dung phản hồi của bạn ở đây]\n\nXin cảm ơn!`;

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Data cho hướng dẫn
  const guideCategories: GuideCategory[] = [
    {
      title: "Hướng dẫn bắt đầu",
      guides: [
        {
          title: "Cách đăng ký tài khoản mới",
          content: `# Đăng ký tài khoản mới\n\nĐể tạo tài khoản mới trên nền tảng TMS Learn Tech, vui lòng làm theo các bước sau:\n\n## Bước 1: Truy cập màn hình đăng ký\n- Mở ứng dụng TMS Learn Tech\n- Nhấn vào nút "Đăng ký" trên màn hình đăng nhập`,
        },
        {
          title: "Tùy chỉnh hồ sơ cá nhân",
          content: `# Tùy chỉnh hồ sơ cá nhân\n\nCập nhật thông tin cá nhân giúp cá nhân hóa trải nghiệm của bạn và nhận được các đề xuất phù hợp hơn.`,
        },
      ],
    },
    {
      title: "Khóa học & Học tập",
      guides: [
        {
          title: "Cách tham gia khóa học",
          content: `# Cách tham gia khóa học\n\nTMS Learn Tech cung cấp nhiều loại khóa học khác nhau, từ miễn phí đến có phí, để phù hợp với nhu cầu học tập của bạn.`,
        },
      ],
    },
  ];

  return (
    <section className="contact-area pt-120 pb-120">
      <div className="container">
        {/* Support Banner */}
        <div className="support-banner">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="support-banner-content">
                <div className="support-banner-icon">
                  <i className="fas fa-headset"></i>
                </div>
                <div className="support-banner-text">
                  <h4>Chúng tôi luôn sẵn sàng giúp đỡ bạn</h4>
                  <p>Đội ngũ hỗ trợ sẵn sàng giải đáp mọi thắc mắc</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 d-flex justify-content-md-end mt-3 mt-md-0">
              <div className="support-banner-buttons">
                <button
                  className="btn btn-light me-2"
                  onClick={() => (window.location.href = "tel:0348740942")}
                >
                  <i className="fas fa-phone me-1"></i> Gọi ngay
                </button>
                <button className="btn btn-outline-light">
                  <i className="fas fa-comment me-1"></i> Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact__info pb-60">
          <h4 className="section-title">Thông tin liên hệ</h4>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="contact-support" style={{ height: "100%" }}>
                <svg
                  width="70"
                  height="70"
                  viewBox="0 0 80 80"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M40.1533 6.25004C39.2892 6.24379 38.5845 6.9391 38.5783 7.8016C38.572 8.6641 39.2658 9.36879 40.1298 9.37504C40.9923 9.38129 41.697 8.68754 41.7033 7.82504C41.7095 6.96254 41.0158 6.25785 40.1533 6.25004ZM40.0822 15.6249C34.0492 15.5821 29.1084 20.4491 29.0628 26.4802C29.0173 32.511 33.887 37.4541 39.9181 37.4996L40.0019 37.4999C45.9945 37.4999 50.8922 32.6474 50.9375 26.6443C50.983 20.6138 46.1134 15.6704 40.0822 15.6249ZM40.0016 34.375L39.9416 34.3747C35.6336 34.3422 32.1552 30.8113 32.1877 26.5036C32.22 22.2154 35.7181 18.7494 39.9988 18.7494L40.0588 18.7497C44.3667 18.7822 47.8452 22.3132 47.8127 26.6208C47.7802 30.9091 44.2822 34.375 40.0016 34.375ZM46.8175 7.43504C46.0047 7.1466 45.1111 7.57239 44.8227 8.38582C44.5344 9.19926 44.9602 10.0922 45.7734 10.3807C52.6558 12.8199 57.2425 19.3747 57.1875 26.6914C57.1811 27.5543 57.8753 28.2591 58.7383 28.2657H58.7503C59.6075 28.2657 60.3059 27.5738 60.3125 26.7149C60.3775 18.0669 54.9542 10.3189 46.8175 7.43504Z"
                    fill="#2EB97E"
                  />
                  <path
                    d="M49.5876 58.8191C59.9803 45.4417 66.4751 38.4659 66.5628 26.7622C66.6728 12.0367 54.7225 0 39.9981 0C25.4456 0 13.549 11.7856 13.4384 26.3638C13.349 38.3848 19.9645 45.3511 30.4289 58.8169C20.0187 60.3725 13.4384 64.2814 13.4384 69.0625C13.4384 72.2652 16.3987 75.1391 21.7742 77.1547C26.6668 78.9894 33.1398 79.9998 40.0006 79.9998C46.8614 79.9998 53.3343 78.9894 58.227 77.1547C63.6025 75.1389 66.5628 72.265 66.5628 69.0623C66.5628 64.2839 59.9885 60.3759 49.5876 58.8191ZM16.5632 26.3873C16.6607 13.5234 27.1568 3.125 39.9984 3.125C52.992 3.125 63.5348 13.7481 63.4379 26.7389C63.3548 37.8536 56.467 44.7031 45.4706 59.038C43.5092 61.5936 41.7079 64.0098 40.0029 66.3734C38.3029 64.0084 36.5376 61.6355 34.5468 59.037C23.0959 44.102 16.4786 37.7702 16.5632 26.3873ZM40.0006 76.875C26.5864 76.875 16.5632 72.7505 16.5632 69.0625C16.5632 66.3275 22.5551 62.8725 32.6298 61.6761C34.8568 64.5981 36.8093 67.2528 38.7243 69.9641C38.8685 70.1682 39.0595 70.3347 39.2813 70.4497C39.5031 70.5647 39.7493 70.6248 39.9992 70.625H40.0006C40.2502 70.625 40.4963 70.5652 40.718 70.4505C40.9398 70.3359 41.1309 70.1698 41.2753 69.9661C43.1721 67.2902 45.1781 64.57 47.3861 61.6778C57.4514 62.8755 63.4379 66.3294 63.4379 69.0627C63.4378 72.7505 53.4148 76.875 40.0006 76.875Z"
                    fill="#2EB97E"
                  />
                </svg>
                <h3>Cơ sở chính</h3>
                <p>
                  140 Lê Trọng Tấn <br /> Tân Phú, TP.HCM
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-support" style={{ height: "100%" }}>
                <i className="fas fa-envelope fa-3x"></i>
                <h3>Email</h3>
                <p>tms.huit@gmail.com</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-support" style={{ height: "100%" }}>
                <i className="fas fa-phone-alt fa-3x"></i>
                <h3>Hotline</h3>
                <p>0348 740 942</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section mb-5">
          <h4 className="section-title">Câu hỏi thường gặp</h4>
          <div className="accordion" id="faqAccordion">
            {faqItems.map((faq, index) => (
              <div className="accordion-item mb-2" key={index}>
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${
                      !faq.isExpanded ? "collapsed" : ""
                    }`}
                    type="button"
                    onClick={() => toggleFaq(index)}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div
                  className={`accordion-collapse collapse ${
                    faq.isExpanded ? "show" : ""
                  }`}
                >
                  <div className="accordion-body">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guides Section */}
        <div className="guides-section mb-5">
          <h4 className="section-title">Hướng dẫn sử dụng</h4>
          <div className="row">
            {guideCategories.map((category, catIndex) => (
              <div className="col-md-6 mb-4" key={catIndex}>
                <div className="guide-category-card">
                  <div className="guide-category-header">
                    <div className="category-iconn">
                      <i className={catIndex === 0 ? "fas fa-book-open" : "fas fa-graduation-cap"}></i>
                    </div>
                    <h5>{category.title}</h5>
                  </div>
                  <div className="guide-items-container">
                    {category.guides.map((guide, guideIndex) => (
                      <div 
                        className="guide-item" 
                        key={guideIndex}
                        onClick={openGuideModal}
                      >
                        <div className="guide-item-content">
                          <div className="guide-item-icon">
                            <i className={
                              guide.title.includes("đăng ký") ? "fas fa-user-plus" :
                              guide.title.includes("hồ sơ") ? "fas fa-user-edit" :
                              guide.title.includes("khóa học") ? "fas fa-laptop-code" : "fas fa-book"
                            }></i>
                          </div>
                          <div className="guide-item-text">
                            <h6>{guide.title}</h6>
                            <p className="guide-item-description">
                              {guide.content.split('\n')[2]?.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                        <div className="guide-item-arrow">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unified Guide Modal - Replace the previous modal that showed specific content */}
        {showGuideModal && (
          <div 
            className="tms-modal-overlay" 
            onClick={handleBackdropClick}
          >
            <div className="tms-modal-dialog" onClick={e => e.stopPropagation()}>
              <div className="tms-modal-content">
                <div className="tms-modal-header">
                  <div className="tms-modal-title-container">
                    <div className="tms-modal-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <h5 className="tms-modal-title">Hướng dẫn sử dụng TMS Learn Tech</h5>
                  </div>
                  <button
                    type="button"
                    className="tms-btn-close"
                    onClick={closeGuideModal}
                    aria-label="Đóng"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="tms-modal-body">
                  <h2 className="guide-heading-1">Tổng quan về TMS Learn Tech</h2>
                  <p className="guide-paragraph">
                    TMS Learn Tech là nền tảng học trực tuyến cung cấp nhiều khóa học đa dạng giúp bạn phát triển kỹ năng và nâng cao kiến thức trong nhiều lĩnh vực. 
                  </p>
                  
                  <div className="guide-heading-2-container">
                    <i className="fas fa-angle-right guide-step-icon"></i>
                    <h3 className="guide-heading-2">Bắt đầu</h3>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Đăng ký tài khoản hoặc đăng nhập nếu bạn đã có tài khoản</span>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Khám phá các khóa học có sẵn trên nền tảng</span>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Đăng ký các khóa học phù hợp với nhu cầu của bạn</span>
                  </div>
                  
                  <div className="guide-heading-2-container">
                    <i className="fas fa-angle-right guide-step-icon"></i>
                    <h3 className="guide-heading-2">Tính năng chính</h3>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Học theo cách riêng của bạn với các bài giảng video chất lượng cao</span>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Hoàn thành bài tập và nhận đánh giá từ giảng viên</span>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Tương tác với cộng đồng học viên và giảng viên</span>
                  </div>
                  <div className="guide-bullet">
                    <span className="guide-bullet-dot">
                      <i className="fas fa-circle-check"></i>
                    </span>
                    <span>Nhận chứng chỉ sau khi hoàn thành khóa học</span>
                  </div>
                  
                  <div className="guide-heading-2-container">
                    <i className="fas fa-angle-right guide-step-icon"></i>
                    <h3 className="guide-heading-2">Hỗ trợ</h3>
                  </div>
                  <p className="guide-paragraph">
                    Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi qua email tms.huit@gmail.com hoặc gọi số hotline 0348 740 942. Chúng tôi luôn sẵn sàng giúp đỡ bạn!
                  </p>
                </div>
                <div className="tms-modal-footer">
                  <button
                    type="button"
                    className="btn tms-btn-primary"
                    onClick={closeGuideModal}
                  >
                    <i className="fas fa-check me-2"></i>
                    Đã hiểu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="feedback-section mb-5">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <i className="fas fa-comment-dots text-primary fs-4 me-2"></i>
                <h4 className="mb-0">Gửi phản hồi của bạn</h4>
              </div>
              <p className="mb-4">
                Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ hỗ trợ tốt
                hơn. Hãy chia sẻ ý kiến hoặc báo cáo vấn đề bạn gặp phải.
              </p>
              <button className="btn btn-primary" onClick={sendFeedback}>
                <i className="fas fa-paper-plane me-2"></i>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="row g-5">
          <div className="col-lg-12">
            <div className="contact__map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3109.391238815206!2d106.6283625444954!3d10.806707065784899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752be27d8b4f4d%3A0x92dcba2950430867!2sHCMC%20University%20of%20Industry%20and%20Trade!5e1!3m2!1sen!2sus!4v1721345411064!5m2!1sen!2sus"
                width="600"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                title="Địa chỉ trường học"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Contacts;
