import React, { useEffect, useState, CSSProperties } from "react";
import { animateScroll as scroll } from "react-scroll";
function Scroll() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    scroll.scrollToTop({
      duration: 800, // Thời gian cuộn (ms)
      smooth: "easeInOutQuad", // Hiệu ứng cuộn mượt mà
    });
  };

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollStyle: CSSProperties = {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    cursor: "pointer",
    transition: "opacity 0.5s ease-in-out, visibility 0.5s ease-in-out",
    opacity: isVisible ? 1 : 0, // Hiển thị hoặc ẩn nút
    visibility: isVisible ? "visible" : "hidden", // Hiển thị hoặc ẩn nút
  };

  return (
    <div>
      <div className="scroll-up" style={scrollStyle} onClick={scrollToTop}>
        <svg
          className="scroll-circle svg-content"
          width="100%"
          height="100%"
          viewBox="-1 -1 102 102"
        >
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </div>
  );
}

export default Scroll;
