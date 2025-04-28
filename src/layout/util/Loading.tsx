import React, { useEffect, useState } from "react";

// const Loadding2: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   return (
//     <div>
//       <h1>Loadding2</h1>
//     </div>
//   );
// };

function Loading() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setLoading(false);
      }, 400); // Ẩn phần tử loading sau 500ms
    };

    window.addEventListener("load", handleLoad); // Thêm sự kiện load vào window

    return () => {
      window.removeEventListener("load", handleLoad); // Cleanup khi component unmount
    };
  }, []);

  if (!loading) return null;

  return (
    <div>
      {/* <div id="loading">
        <div id="loading-center">
          <div id="loading-center-absolute">
            <div className="loading-icon text-center d-flex flex-column align-items-center justify-content-center">
              <img
                className="loading-logo"
                src="assets/images/preloader.svg"
                alt="icon"
              />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Loading;
