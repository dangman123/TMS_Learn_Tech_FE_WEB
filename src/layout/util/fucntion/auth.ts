import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import useRefreshToken from "./useRefreshToken";
import { useNavigate } from "react-router-dom";

// Định nghĩa interface cho token đã giải mã
interface DecodedToken {
  exp: number;
}

/**
 * Kiểm tra xem token đã hết hạn hay chưa
 * @param {string | null} token - Access token
 * @returns {boolean} - Trả về true nếu token đã hết hạn
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token); // Giải mã token
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    return decodedToken.exp < currentTime; // Trả về true nếu token đã hết hạn
  } catch (error) {
    console.error("Không thể giải mã token:", error);
    return true; // Nếu có lỗi, coi như token đã hết hạn
  }
}

/**
 * Định nghĩa kiểu dữ liệu của response từ API refresh token.
 */
interface RefreshTokenResponse {
  jwt: string; // Access token
  refreshToken: string;
  responsiveDTOJWT: {
    id: number;
    fullname: string;
    email: string;
    roleId: number;
  };
}
/**
 * Gọi API để refresh access token.
 * Lưu refresh token vào cookie thay vì localStorage.
 * @returns {Promise<string | null>} - Trả về access token mới nếu thành công, null nếu thất bại.
 */
export async function refreshToken(): Promise<string | null> {

  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    console.error("Không tìm thấy refresh token.");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_HOST}/account/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    if (response.ok) {
      const data: RefreshTokenResponse = await response.json();

      localStorage.setItem("authToken", data.jwt);

      Cookies.set("refreshToken", data.refreshToken, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
        // httpOnly: true // Cờ này chỉ có thể được đặt bởi server-side (client-side không thể)
      });

      localStorage.setItem("userInfo", JSON.stringify(data.responsiveDTOJWT));

      return data.jwt;
    } else {
      console.error("Lỗi khi refresh token:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Có lỗi khi gọi API refresh token:", error);
    return null;
  }
}
/**
 * Hàm gọi API với access token.
 * @param {string} url - URL của API.
 * @param {RequestInit} options - Các tùy chọn cho request.
 * @returns {Promise<Response | null>} - Trả về kết quả của API hoặc null nếu không thành công.
 */
export async function makeApiRequest(
  url: string,
  options: RequestInit
): Promise<Response | null> {
  let token = localStorage.getItem("authToken");

  if (isTokenExpired(token)) {
    token = await refreshToken();
  }

  if (token) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } else {
    console.error("Không thể thực hiện yêu cầu vì không có token.");
    return null;
  }
}



export async function makePutRequest(url: string, data: any) {
  try {
    // Kiểm tra token trước khi thực hiện yêu cầu
    let token = localStorage.getItem("authToken");

    // Kiểm tra token hết hạn và refresh nếu cần
    if (isTokenExpired(token)) {
      token = await refreshToken();
    }

    if (!token) {
      throw new Error("Không thể thực hiện yêu cầu PUT vì không có token.");
    }

    // Chuẩn bị các tùy chọn cho fetch
    const options: RequestInit = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Kèm Authorization
      },
      body: JSON.stringify(data), // Gửi dữ liệu dưới dạng JSON
    };

    // Thực hiện yêu cầu PUT
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Lỗi khi gửi yêu cầu PUT tới ${url}: ${response.statusText}`
      );
    }

    return await response.json(); // Trả về dữ liệu JSON (nếu có)
  } catch (error) {
    console.error("Lỗi khi gọi PUT API:", error);
    throw error;
  }
}

// export const authTokenLogin = async () => {
//   const refresh = useRefreshToken();
//   const navigate = useNavigate();
  
//   let token = localStorage.getItem("authToken");
//   if (token && isTokenExpired(token)) {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken) {
//       navigate("/dang-nhap");
//       return;
//     }
//     token = await refresh();
//     if (!token) {
//       navigate("/dang-nhap");
//       return;
//     }
//     localStorage.setItem("authToken", token);
//   }
// }

export const authTokenLogin = async (refreshToken: any, refresh: any, navigate: any) => {
  let token = localStorage.getItem("authToken");
  if (token && isTokenExpired(token)) {
    if (!refreshToken) {
      navigate("/dang-nhap");
      return null;
    }
    token = await refresh(refreshToken);
    if (!token) {
      navigate("/dang-nhap");
      return null; 
    }
    localStorage.setItem("authToken", token);
  }

  return token;
}
