import axios from "axios";

const useRefreshToken = () => {
  const refresh = async () => {
    try {
      // Lấy refreshToken từ localStorage
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.error("Không tìm thấy refreshToken trong localStorage.");
        return null;
      }

      // Gửi yêu cầu làm mới token bằng phương thức GET
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_HOST}/account/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const data = response.data;
        // Lưu token mới và thông tin người dùng vào localStorage
        localStorage.setItem("authToken", data.jwt);
        if (data.responsiveDTOJWT) {
          localStorage.setItem("userInfo", JSON.stringify(data.responsiveDTOJWT));
        }
        // Cập nhật lại refreshToken mới nếu có
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        return data.jwt; // Trả về token mới
      } else {
        console.error(
          `Failed to refresh token: ${response.status} ${response.statusText}`
        );
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };
  return refresh;
};

export default useRefreshToken;
