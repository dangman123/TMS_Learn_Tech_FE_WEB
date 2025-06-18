import React, { useEffect, useState } from "react";
import { CoureseDetail } from "../../../../model/CoureseDetail";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CHECK_ACTIVED_ENCROLLED_COURSE,
  CHECK_TYPE_COURSE,
} from "../../../../api/api";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import { encryptData } from "../../../util/encryption";
import { sendActionActivity } from "../../../../service/WebSocketActions";
interface CourseSidebarProps {
  course: CoureseDetail;
  total: {
    total_students: number;
    total_lessons: number;
  };
}
interface AuthData {
  id: number;
  fullname: string;
  email: string;
  roleId: number;
}
export const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  total,
}) => {

  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [courseType, setCourseType] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isInCart, setIsInCart] = useState<boolean>(false);
  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Kiểm tra loại khóa học (FREE/FEE)
        const courseTypeResponse = await fetch(CHECK_TYPE_COURSE(course.id));
        const courseType = await courseTypeResponse.text();
        setCourseType(courseType);
        const authData = localStorage.getItem("authData");
        if (authData) {
          const parsedAuthData = JSON.parse(authData); // Chuyển chuỗi JSON thành đối tượng JavaScript

          if (parsedAuthData.id) {
            // Kiểm tra nếu có id trong đối tượng
            const enrollmentResponse = await fetch(
              `${CHECK_ACTIVED_ENCROLLED_COURSE()}?userId=${parsedAuthData.id
              }&courseId=${course.id}`
            );
            const enrollmentStatus = await enrollmentResponse.text();
            setIsEnrolled(enrollmentStatus === "Actived");
          }
        }
      } catch (error) {
        console.error(
          "Error fetching course data or enrollment status:",
          error
        );
      }
    };
    fetchCourseData();
    
    // Kiểm tra xem khóa học đã có trong giỏ hàng hay chưa
    checkIfItemInCart();
  }, []);
  
  // Hàm kiểm tra xem khóa học đã có trong giỏ hàng chưa
  const checkIfItemInCart = async () => {
    try {
      if (!userId) return;
      
      const token = localStorage.getItem("authToken");
      if (!token) return;
      
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("Không thể kiểm tra giỏ hàng");
        return;
      }
      
      const cartData = await response.json();
      
      if (cartData.status === 200 && cartData.data) {
        // Kiểm tra xem courseId có trong giỏ hàng không
        const isCourseInCart = cartData.data.some((item: any) => 
          item.courseId === course.id
        );
        
        setIsInCart(isCourseInCart);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra giỏ hàng:", error);
    }
  };

  const handleGoToCoursePlayer = async (courseId: number) => {
    try {
      let token = localStorage.getItem("token");
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/status?accountId=${userId}&courseId=${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const status = await response.text();
        if (status === "Actived") {
          const responseCourse = await fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/courses/${courseId}/first-chapter-lesson`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (responseCourse.ok) {
            const courseData = await responseCourse.json();
            const { chapterId, lessonId } = courseData;
            const responseProgress = await fetch(
              `${process.env.REACT_APP_SERVER_HOST}/api/progress/add?accountId=${userId}&courseId=${courseId}&chapterId=${chapterId}&lessonId=${lessonId}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (responseProgress.ok) {
              const progress = await responseProgress.json();
              const encryptedCourseId = encryptData(courseId);
              const encryptedChapterId = encryptData(chapterId);
              const encryptedLessonId = encryptData(lessonId);

              localStorage.setItem("encryptedCourseId", encryptedCourseId);
              localStorage.setItem("encryptedChapterId", encryptedChapterId);
              localStorage.setItem("encryptedLessonId", encryptedLessonId);

              window.location.href = `/khoa-hoc-thu/vao-hoc`;
            } else {
              alert("Không thể thêm tiến trình học.");
            }
          } else {
            alert("Không thể lấy chương và bài học đầu tiên.");
          }
        } else {
          const encryptedCourseId = encryptData(courseId);
          localStorage.setItem("encryptedCourseId", encryptedCourseId);
          window.location.href = `/khoa-hoc-thu/vao-hoc`;
        }
      } else {
        alert("Không thể lấy thông tin khóa học.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      alert("Đã xảy ra lỗi khi kiểm tra thông tin khóa học.");
    }
  };


  const getAuthDataFromLocalStorage = (): AuthData | null => {
    const authFromStorage = localStorage.getItem("authData");
    return authFromStorage ? JSON.parse(authFromStorage) : null;
  };
  // Thêm khóa học vào giỏ hàng
  const addToCart = async () => {
    try {
      if (!userId || !course) {
        toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
        navigate("/dang-nhap");
        return;
      }
      
      // Lấy token từ localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigate("/dang-nhap");
        return;
      }
      
      // Tạo đối tượng dữ liệu để gửi lên API
      const cartData = {
        type: "COURSE", // Loại COURSE
        price: course.price,
        courseId: course.id,
        testId: null,
        courseBundleId: null,
        cartItemId: ""
      };
      
      // Gọi API để thêm vào giỏ hàng
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/cart/${userId}/add-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartData)
      });
      
      const responseData = await response.json();
      
      // Xử lý phản hồi từ API
      if (responseData.status === 200) {
        toast.success("Đã thêm khóa học vào giỏ hàng");
        setIsInCart(true); // Cập nhật state để biết khóa học đã có trong giỏ hàng
        
        // Phát sự kiện để cập nhật số lượng giỏ hàng trong header
        window.dispatchEvent(new Event('cart-updated'));
      
      } else if (responseData.status === 409) {
        // Nếu khóa học đã có trong giỏ hàng (mã lỗi 409 = conflict)
        toast.info("Khóa học này đã có trong giỏ hàng của bạn");
        setIsInCart(true);
      } else {
        // Các lỗi khác
        toast.error(responseData.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      
      // Kiểm tra xem khóa học đã được thêm thành công chưa
      await checkIfItemInCart();
      
      if (isInCart) {
        toast.success("Đã thêm khóa học vào giỏ hàng");
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };
  // Chuyển đến trang giỏ hàng
  const goToCart = () => {
    navigate("/gio-hang");
  };
  
  // Thêm CSS cho nút giỏ hàng
  const cartButtonStyle = {
    backgroundColor: "#f0ad4e", // Màu cam cho nút giỏ hàng
    borderColor: "#eea236"
  };

  const handleCheck = async (e: React.MouseEvent) => {
    e.preventDefault();
    const authData = getAuthDataFromLocalStorage();
    if (!authData) {
      toast.error("Vui lòng đăng nhập để tham gia khóa học");
      return;
    }

    if (isEnrolled === true) {
      // Nếu đã đăng ký khóa học, vào học
      handleGoToCoursePlayer(course.id);
    } else {
      if (courseType === "FREE") {
        try {
          const token = localStorage.getItem("authToken");
          const enrollResponse = await fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/enroll?accountId=${authData.id}&courseId=${course.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
              },
            }
          );
          const enrollData = await enrollResponse.text(); 
          if (enrollResponse.ok) {
            
            if (authData.id) {
              const data = { "testId": null, "courseId": course.id, "lessonId": null, "videoId": null, "action": "Đăng ký khóa học" + course.title }
              sendActionActivity(authData.id.toString(), "/app/enroll_course", data, "Đăng ký khóa học" + course.title)
            }
            
            // sendActionActivity(authData.id.toString().toString(), "/app/enroll_course", data, "Đăng ký khóa học" + course.title)
            handleGoToCoursePlayer(course.id);
          } else {
            toast.error("Đăng ký khóa học không thành công!");
          }
        } catch (error: any) {
          toast.error("Đã xảy ra lỗi khi ghi danh:", error);
        }
      } else {
        // Nếu khóa học có phí
        if (isInCart) {
          // Nếu đã có trong giỏ hàng, chuyển đến trang giỏ hàng
          goToCart();
        } else {
          // Nếu chưa có trong giỏ hàng, thêm vào giỏ hàng
          addToCart();
        }
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 0) return "Invalid time";
    const minutes = Math.floor(seconds / 60);
    const formattedMinutes = minutes < 10 ? String(minutes).padStart(2, '0') : minutes;
    const remainingSeconds = seconds % 60;
    const formattedSecond = remainingSeconds < 10 ? String(remainingSeconds).padStart(2, '0') : remainingSeconds;
    return `${formattedMinutes}:${formattedSecond}`;
  };

  return (
    <div className="courses-details__item-right" >
      <div className="item" style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px" }}>
        <h3>Khóa học bao gồm:</h3>
        <ul>
          <li>
            <svg
              className="me-1"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5631 11.7661L10.7746 9.67474V5.4145C10.7746 4.98614 10.4283 4.63989 9.99997 4.63989C9.57161 4.63989 9.22536 4.98614 9.22536 5.4145V10.0621C9.22536 10.3061 9.34001 10.5361 9.53521 10.6818L12.6336 13.0056C12.7673 13.1063 12.9302 13.1606 13.0976 13.1605C13.3338 13.1605 13.5662 13.0543 13.718 12.8499C13.9752 12.5082 13.9055 12.0225 13.5631 11.7661Z"
                fill="#2EB97E"
              />
              <path
                d="M10 0C4.48566 0 0 4.48566 0 10C0 15.5143 4.48566 20 10 20C15.5143 20 20 15.5143 20 10C20 4.48566 15.5143 0 10 0ZM10 18.4508C5.34082 18.4508 1.54918 14.6592 1.54918 10C1.54918 5.34082 5.34082 1.54918 10 1.54918C14.66 1.54918 18.4508 5.34082 18.4508 10C18.4508 14.6592 14.6592 18.4508 10 18.4508Z"
                fill="#2EB97E"
              />
            </svg>

            <p>
              <strong>Thời gian:</strong> <span>{formatTime(course.duration)}</span>
            </p>
          </li>
          <li>
            <svg
              className="me-1"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.9392 19.6967H3.75734C2.90885 19.6967 2.24219 19.03 2.24219 18.1815V1.81789C2.24219 0.969401 2.90885 0.302734 3.75734 0.302734H16.2422C17.0907 0.302734 17.7573 0.969401 17.7573 1.81789V15.9694C17.7573 16.1512 17.6361 16.2724 17.4543 16.2724C17.2725 16.2724 17.1513 16.1512 17.1513 15.9694V1.81789C17.1513 1.30273 16.7573 0.908795 16.2422 0.908795H3.75734C3.24219 0.908795 2.84825 1.30273 2.84825 1.81789V18.1815C2.84825 18.6967 3.24219 19.0906 3.75734 19.0906H13.9392C14.121 19.0906 14.2422 19.2118 14.2422 19.3936C14.2422 19.5755 14.121 19.6967 13.9392 19.6967Z"
                fill="#2EB97E"
              />
              <path
                d="M13.9995 19.6964H13.9692C13.7874 19.6964 13.6662 19.5752 13.6662 19.3933V17.0903C13.6662 16.3024 14.3026 15.6661 15.0904 15.6661H17.4238C17.545 15.6661 17.6662 15.7267 17.6965 15.8479C17.7571 15.9691 17.7268 16.0903 17.6359 16.1812L14.2116 19.6055C14.151 19.6661 14.0904 19.6964 13.9995 19.6964ZM15.0904 16.2721C14.6359 16.2721 14.2723 16.6358 14.2723 17.0903V18.6964L16.6965 16.2721H15.0904ZM10.0298 5.30244C9.99953 5.30244 9.96922 5.30244 9.93892 5.27214L5.6965 3.84789C5.57528 3.81759 5.48438 3.69638 5.48438 3.57517C5.48438 3.45395 5.57528 3.33274 5.6965 3.30244L9.93892 1.8782C9.99953 1.84789 10.0601 1.84789 10.1207 1.8782L14.242 3.30244C14.3632 3.33274 14.4541 3.45395 14.4541 3.57517C14.4541 3.69638 14.3632 3.81759 14.242 3.84789L10.1207 5.27214C10.0904 5.30244 10.0601 5.30244 10.0298 5.30244ZM6.7268 3.57517L10.0298 4.66607L13.2116 3.57517L10.0298 2.48426L6.7268 3.57517Z"
                fill="#2EB97E"
              />
              <path
                d="M9.99929 6.99953C9.02959 6.99953 8.02959 6.93892 6.99929 6.81771C6.84777 6.78741 6.72656 6.66619 6.72656 6.51468V4.02983C6.72656 3.84801 6.84777 3.7268 7.02959 3.7268C7.21141 3.7268 7.33262 3.84801 7.33262 4.02983V6.24195C9.1205 6.42377 10.8781 6.45407 12.5447 6.24195V4.02983C12.5447 3.84801 12.666 3.7268 12.8478 3.7268C13.0296 3.7268 13.1508 3.84801 13.1508 4.02983V6.51468C13.1508 6.66619 13.0296 6.78741 12.8781 6.81771C11.969 6.93892 10.9993 6.99953 9.99929 6.99953ZM13.9993 6.36316C13.8175 6.36316 13.6963 6.24195 13.6963 6.06013V3.78741C13.6963 3.60559 13.8175 3.48438 13.9993 3.48438C14.1811 3.48438 14.3023 3.60559 14.3023 3.78741V6.06013C14.3023 6.24195 14.1811 6.36316 13.9993 6.36316Z"
                fill="#2EB97E"
              />
              <path
                d="M14.2093 6.48497H13.8153C13.6335 6.48497 13.5123 6.36375 13.5123 6.18194C13.5123 6.00012 13.6335 5.87891 13.8153 5.87891H14.2093C14.3911 5.87891 14.5123 6.00012 14.5123 6.18194C14.5123 6.36375 14.3911 6.48497 14.2093 6.48497ZM14.785 9.42436H8.57292C8.3911 9.42436 8.26989 9.30315 8.26989 9.12133C8.26989 8.93951 8.3911 8.8183 8.57292 8.8183H14.785C14.9669 8.8183 15.0881 8.93951 15.0881 9.12133C15.0881 9.30315 14.9669 9.42436 14.785 9.42436ZM14.785 11.9395H8.57292C8.3911 11.9395 8.26989 11.8183 8.26989 11.6365C8.26989 11.4547 8.3911 11.3335 8.57292 11.3335H14.785C14.9669 11.3335 15.0881 11.4547 15.0881 11.6365C15.0881 11.8183 14.9669 11.9395 14.785 11.9395ZM14.785 14.4547H8.57292C8.3911 14.4547 8.26989 14.3335 8.26989 14.1516C8.26989 13.9698 8.3911 13.8486 8.57292 13.8486H14.785C14.9669 13.8486 15.0881 13.9698 15.0881 14.1516C15.0881 14.3335 14.9669 14.4547 14.785 14.4547ZM11.6941 16.9698H8.57292C8.3911 16.9698 8.26989 16.8486 8.26989 16.6668C8.26989 16.485 8.3911 16.3638 8.57292 16.3638H11.6941C11.8759 16.3638 11.9972 16.485 11.9972 16.6668C11.9972 16.8486 11.8759 16.9698 11.6941 16.9698ZM6.33049 9.96982H5.20928C5.02746 9.96982 4.90625 9.8486 4.90625 9.66679V8.54557C4.90625 8.36376 5.02746 8.24254 5.20928 8.24254H6.33049C6.51231 8.24254 6.63352 8.36376 6.63352 8.54557V9.66679C6.63352 9.8486 6.51231 9.96982 6.33049 9.96982ZM5.51231 9.36375H6.02746V8.8486H5.51231V9.36375ZM6.33049 12.485H5.20928C5.02746 12.485 4.90625 12.3638 4.90625 12.1819V11.0607C4.90625 10.8789 5.02746 10.7577 5.20928 10.7577H6.33049C6.51231 10.7577 6.63352 10.8789 6.63352 11.0607V12.1819C6.63352 12.3638 6.51231 12.485 6.33049 12.485ZM5.51231 11.8789H6.02746V11.3638H5.51231V11.8789ZM6.33049 15.0001H5.20928C5.02746 15.0001 4.90625 14.8789 4.90625 14.6971V13.5759C4.90625 13.3941 5.02746 13.2728 5.20928 13.2728H6.33049C6.51231 13.2728 6.63352 13.3941 6.63352 13.5759V14.6971C6.63352 14.8789 6.51231 15.0001 6.33049 15.0001ZM5.51231 14.3941H6.02746V13.8789H5.51231V14.3941ZM6.33049 17.5153H5.20928C5.02746 17.5153 4.90625 17.3941 4.90625 17.2122V16.091C4.90625 15.9092 5.02746 15.788 5.20928 15.788H6.33049C6.51231 15.788 6.63352 15.9092 6.63352 16.091V17.2122C6.63352 17.3941 6.51231 17.5153 6.33049 17.5153ZM5.51231 16.9092H6.02746V16.3941H5.51231V16.9092Z"
                fill="#2EB97E"
              />
            </svg>
            <p>
              <strong>Bài học:</strong> <span>{total.total_lessons}</span>
            </p>
          </li>
          <li>
            <svg
              className="me-1"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.0013 4.11565C9.68563 3.50373 9.20764 2.99048 8.61969 2.63213C8.03175 2.27377 7.35652 2.08414 6.66797 2.08398C4.59839 2.08398 2.91797 3.7644 2.91797 5.83398C2.91797 7.90357 4.59839 9.58398 6.66797 9.58398C7.35652 9.58383 8.03175 9.3942 8.61969 9.03584C9.20764 8.67749 9.68563 8.16424 10.0013 7.55232C10.3169 8.1643 10.7949 8.6776 11.3828 9.03596C11.9708 9.39433 12.6461 9.58393 13.3346 9.58398C15.4042 9.58398 17.0846 7.90357 17.0846 5.83398C17.0846 3.7644 15.4042 2.08398 13.3346 2.08398C12.6461 2.08414 11.9709 2.27377 11.3829 2.63213C10.795 2.99048 10.317 3.50373 10.0013 4.11565ZM13.3346 2.91732C14.9442 2.91732 16.2513 4.2244 16.2513 5.83398C16.2513 7.44357 14.9442 8.75065 13.3346 8.75065C11.7251 8.75065 10.418 7.44357 10.418 5.83398C10.418 4.2244 11.7251 2.91732 13.3346 2.91732ZM6.66797 2.91732C8.27755 2.91732 9.58464 4.2244 9.58464 5.83398C9.58464 7.44357 8.27755 8.75065 6.66797 8.75065C5.05839 8.75065 3.7513 7.44357 3.7513 5.83398C3.7513 4.2244 5.05839 2.91732 6.66797 2.91732ZM10.0013 10.7298C10.518 10.5282 11.0801 10.4173 11.668 10.4173H15.0013C17.5326 10.4173 19.5846 12.4694 19.5846 15.0007V16.6673C19.5846 16.9988 19.4529 17.3168 19.2185 17.5512C18.9841 17.7856 18.6662 17.9173 18.3346 17.9173H1.66797C1.33645 17.9173 1.01851 17.7856 0.784085 17.5512C0.549665 17.3168 0.417969 16.9988 0.417969 16.6673V15.0007C0.417969 12.4694 2.47005 10.4173 5.0013 10.4173H8.33464C8.92255 10.4173 9.48464 10.5282 10.0013 10.7298ZM12.0846 15.0007V16.6673C12.0846 16.7778 12.0407 16.8838 11.9626 16.9619C11.8845 17.0401 11.7785 17.084 11.668 17.084H1.66797C1.55746 17.084 1.45148 17.0401 1.37334 16.9619C1.2952 16.8838 1.2513 16.7778 1.2513 16.6673V15.0007C1.2513 14.0061 1.64639 13.0523 2.34965 12.349C3.05291 11.6457 4.00674 11.2507 5.0013 11.2507H8.33464C9.3292 11.2507 10.283 11.6457 10.9863 12.349C11.6895 13.0523 12.0846 14.0061 12.0846 15.0007ZM12.8467 17.084H18.3346C18.4451 17.084 18.5511 17.0401 18.6293 16.9619C18.7074 16.8838 18.7513 16.7778 18.7513 16.6673V15.0007C18.7513 14.0061 18.3562 13.0523 17.653 12.349C16.9497 11.6457 15.9959 11.2507 15.0013 11.2507H11.668C11.4551 11.2507 11.2459 11.2686 11.0426 11.3027C11.6242 11.728 12.0972 12.2845 12.4231 12.9271C12.749 13.5697 12.9185 14.2802 12.918 15.0007V16.6673C12.918 16.8136 12.893 16.9536 12.8467 17.084Z"
                fill="#2EB97E"
              />
            </svg>

            <p>
              <strong>Học viên:</strong> <span>{total.total_students}</span>
            </p>
          </li>

          <li>
            <svg
              className="me-1"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5927 14.6462C18.4506 13.2485 18.9037 11.64 18.9015 9.99999C18.9037 8.35989 18.4506 6.75117 17.5927 5.35339L17.5879 5.34559C16.7919 4.04823 15.6765 2.97667 14.3484 2.23331C13.0202 1.48994 11.5235 1.09961 10.0015 1.09961C8.4794 1.09961 6.98277 1.48994 5.65458 2.23331C4.32639 2.97667 3.21102 4.04823 2.41507 5.34559L2.41027 5.35339C1.55445 6.7521 1.10156 8.36002 1.10156 9.99979C1.10156 11.6396 1.55445 13.2475 2.41027 14.6462L2.41527 14.6542C3.21125 15.9515 4.32662 17.023 5.6548 17.7663C6.98298 18.5096 8.47959 18.8999 10.0016 18.8999C11.5237 18.8999 13.0203 18.5095 14.3484 17.7662C15.6766 17.0228 16.7919 15.9513 17.5879 14.654L17.5927 14.6462ZM11.1391 17.3744C10.9694 17.5381 10.7742 17.6729 10.5611 17.7736C10.3862 17.8567 10.195 17.8998 10.0014 17.8998C9.80774 17.8998 9.61655 17.8567 9.44167 17.7736C9.03618 17.5665 8.68907 17.261 8.43207 16.8852C7.90723 16.1267 7.51831 15.2827 7.28267 14.391C8.188 14.3353 9.09427 14.3069 10.0015 14.3058C10.9083 14.3058 11.8146 14.3342 12.7205 14.391C12.59 14.8495 12.4271 15.2981 12.2329 15.7334C11.9771 16.3456 11.6058 16.9028 11.1391 17.3744ZM2.11887 10.4998H5.70867C5.73206 11.5015 5.84065 12.4993 6.03327 13.4826C5.05193 13.569 4.07313 13.6877 3.09687 13.8386C2.52512 12.8129 2.1909 11.6719 2.11887 10.4998ZM3.09687 6.16119C4.07273 6.31239 5.05187 6.43105 6.03427 6.51719C5.84131 7.50034 5.73252 8.49815 5.70907 9.49979H2.11887C2.19093 8.32776 2.52514 7.18685 3.09687 6.16119ZM8.86387 2.62519C9.03349 2.4615 9.22873 2.32666 9.44187 2.22599C9.61675 2.14289 9.80794 2.09978 10.0016 2.09978C10.1952 2.09978 10.3864 2.14289 10.5613 2.22599C10.9668 2.43309 11.3139 2.73853 11.5709 3.11439C12.0957 3.87286 12.4846 4.71684 12.7203 5.60859C11.8149 5.66432 10.9087 5.69272 10.0015 5.69379C9.09467 5.69379 8.18833 5.66539 7.28247 5.60859C7.41292 5.15011 7.57587 4.70151 7.77007 4.26619C8.02579 3.65396 8.39717 3.09679 8.86387 2.62519ZM17.8841 9.49979H14.2943C14.2709 8.49811 14.1623 7.50025 13.9697 6.51699C14.951 6.43059 15.9298 6.31192 16.9061 6.16099C17.4778 7.18671 17.812 8.32769 17.8841 9.49979ZM7.03907 13.4048C6.84353 12.4481 6.7331 11.476 6.70907 10.4998H13.2941C13.2703 11.476 13.16 12.4482 12.9647 13.405C11.978 13.3402 10.9903 13.3071 10.0015 13.3058C9.01347 13.3058 8.026 13.3388 7.03907 13.4048ZM12.9639 6.59479C13.1594 7.55148 13.2698 8.52361 13.2939 9.49979H6.70907C6.73287 8.52356 6.8431 7.55136 7.03847 6.59459C8.02513 6.65939 9.01287 6.69245 10.0017 6.69379C10.9897 6.69379 11.9771 6.66072 12.9641 6.59459L12.9639 6.59479ZM14.2939 10.4998H17.8841C17.812 11.6718 17.4778 12.8127 16.9061 13.8384C15.9301 13.6872 14.9509 13.5685 13.9687 13.4824C14.1616 12.4992 14.2704 11.5014 14.2939 10.4998ZM16.3065 5.24079C15.4531 5.36385 14.5973 5.46132 13.7391 5.53319C13.5848 4.95879 13.3859 4.39735 13.1441 3.85399C12.9233 3.354 12.6454 2.8812 12.3161 2.44499C13.9076 2.93312 15.3042 3.91162 16.3065 5.24079ZM4.41547 4.41359C5.32845 3.49973 6.45167 2.82378 7.68667 2.44499C7.66787 2.46939 7.64867 2.49259 7.63027 2.51719C6.99546 3.43097 6.53306 4.4531 6.26587 5.53319C5.40747 5.46052 4.55107 5.36305 3.69667 5.24079C3.91699 4.94888 4.15716 4.67249 4.41547 4.41359ZM3.69667 14.7588C4.54987 14.6357 5.40567 14.5383 6.26407 14.4664C6.41831 15.0408 6.61725 15.6022 6.85907 16.1456C7.07989 16.6456 7.35773 17.1184 7.68707 17.5546C6.09554 17.0665 4.69894 16.0879 3.69667 14.7588ZM15.5879 15.586C14.6749 16.4999 13.5517 17.1758 12.3167 17.5546C12.3355 17.5302 12.3547 17.507 12.3731 17.4824C13.0079 16.5686 13.4703 15.5465 13.7375 14.4664C14.5959 14.5391 15.4523 14.6365 16.3067 14.7588C16.0863 15.0507 15.8462 15.3271 15.5879 15.586Z"
                fill="#2EB97E"
              />
            </svg>
            <p>
              <strong>Ngôn ngữ:</strong> <span>{course.language}</span>
            </p>
          </li>
        </ul>

        <span className="price">
          {courseType === "FREE" ? (
            <span style={{ color: "green", fontSize: "25px" }}>Miễn Phí</span>
          ) : (
            <>
              Giá gốc{" "}
              <del style={{ color: "#2eb97e" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(course.cost)}
              </del>
              <br />
              <span style={{ color: "red", fontSize: "25px" }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(course.price)}
              </span>
            </>
          )}
        </span>

        <a
          href="#"
          className={`btn-one ${isInCart && !isEnrolled ? 'cart-button' : ''}`}
          onClick={handleCheck}
        >
          {course.purchased
            ? "Vào học"
            : isInCart
              ? "Đến giỏ hàng"
              : courseType === "FREE" 
                ? "Đăng ký miễn phí" 
                : "Thêm vào giỏ hàng"}
          <i className={`${isInCart && !isEnrolled ? 'fa-solid fa-shopping-cart' : 'fa-light fa-arrow-right-long'}`}></i>
        </a>
      </div>
    </div>
  );
};
