import React, { useEffect, useState } from "react";

const HomeLogin: React.FC = () => {
  const [user, setUser] = useState<any>(null); // Trạng thái lưu thông tin user

  //   useEffect(() => {
  //     const fetchUser = async () => {
  //       try {
  //         const response = await fetch("${process.env.REACT_APP_SERVER_HOST}/account/oauth2/success", {
  //           method: "GET",
  //           credentials: "include", // Để gửi cookie nếu cần thiết
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         });

  //         if (response.ok) {
  //           const data = await response.json(); // Chuyển đổi dữ liệu API sang JSON
  //           setUser(data); // Lưu dữ liệu user vào state
  //         } else {
  //           console.error("Lỗi khi kết nối API:", response.statusText);
  //         }
  //       } catch (error) {
  //         console.error("Lỗi khi lấy thông tin người dùng:", error);
  //       }
  //     };

  //     fetchUser();
  //   }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {user ? (
        <>
          <h1>Chào mừng, {user.name}</h1>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>Đang tải thông tin người dùng...</p>
      )}
    </div>
  );
};

export default HomeLogin;
