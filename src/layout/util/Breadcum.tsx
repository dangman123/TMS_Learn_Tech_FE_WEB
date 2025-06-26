// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { useLocation, Link } from "react-router-dom";

// import {
//   GET_USER_CATEGORY_LEVEL_1,
//   GET_USER_CATEGORY_LEVEL_2,
//   GET_USER_CATEGORY_LEVEL_3,
// } from "../../api/api";

// interface Category {
//   id: number;
//   name: string;
//   level: number;
//   parentId: number | null;
//   type: string;
// }

// function Breadcum() {
//   const location = useLocation(); // Lấy đường dẫn hiện tại từ useLocation()
//   // const [courseCategories, setCourseCategories] = useState<CategoryCourse[]>(
//   //   []
//   // );
//   const [level1Categories, setLevel1Categories] = useState<Category[]>([]);
//   const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
//   const [level3Categories, setLevel3Categories] = useState<Category[]>([]);

//   const [level1CategoriesCourse, setLevel1CategoriesCourse] = useState<Category[]>([]);
//   const [level2CategoriesCourse, setLevel2CategoriesCourse] = useState<Category[]>([]);
//   const [level3CategoriesCourse, setLevel3CategoriesCourse] = useState<Category[]>([]);



//   const fetchCourseCategories = async () => {
//     // startLoading();
//     try {
//       const level1Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_1);
//       const level1Filtered = level1Response.data.filter(category => category.type === "course");
//       setLevel1CategoriesCourse(level1Filtered);

//       const level2Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_2);
//       const level2Filtered = level2Response.data.filter(category => category.type === "course");
//       setLevel2CategoriesCourse(level2Filtered);

//       const level3Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_3);
//       const level3Filtered = level3Response.data.filter(category => category.type === "course");
//       setLevel3CategoriesCourse(level3Filtered);

//       // stopLoading();
//     } catch (error) {
//       // stopLoading();
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const fetchCategories = async () => {
//     // startLoading();
//     try {
//       const level1Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_1);
//       const level1Filtered = level1Response.data.filter(category => category.type === "document");
//       setLevel1Categories(level1Filtered);

//       const level2Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_2);
//       const level2Filtered = level2Response.data.filter(category => category.type === "document");
//       setLevel2Categories(level2Filtered);

//       const level3Response = await axios.get<Category[]>(GET_USER_CATEGORY_LEVEL_3);
//       const level3Filtered = level3Response.data.filter(category => category.type === "document");
//       setLevel3Categories(level3Filtered);

//       // stopLoading();
//     } catch (error) {
//       // stopLoading();
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const removeVietnameseTones = (str: any) => {
//     return str
//       .normalize("NFD") // Chuyển đổi ký tự Unicode
//       .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
//       .replace(/đ/g, "d") // Thay thế chữ đ thường
//       .replace(/Đ/g, "D") // Thay thế chữ Đ hoa
//       .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt
//       .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
//       .toLowerCase(); // Chuyển tất cả thành chữ thường
//   };

//   useEffect(() => {
//     fetchCourseCategories();
//     fetchCategories();
//   }, []);
//   // Hàm để tạo breadcrumb
//   const createBreadcrumb = () => {
//     // fetchCourseCategories();
//     const pathnames = location.pathname.split("/").filter((x) => x); // Loại bỏ "danh-muc" khỏi đường dẫn
//     const breadcrumbItems = [];

//     // Thêm breadcrumb cho "Trang chủ" vào đầu danh sách
//     breadcrumbItems.push(
//       <li key="home" className="breadcrumb-item">
//         <Link to="/">Trang chủ</Link>
//       </li>
//     );

//     // Duyệt qua các phần trong đường dẫn và tạo breadcrumb cho từng phần
//     pathnames.forEach((part, index) => {
//       // courseCategories.forEach((courseCategorie) => {
//       //   if (part === removeVietnameseTones(courseCategorie.name)) {
//       //     part = courseCategorie.name;
//       //   }
//       // });
//       level1CategoriesCourse.forEach((level1) => {
//         if (part === removeVietnameseTones(level1.name)) {
//           part = level1.name;
//         }
//       });

//       level2CategoriesCourse.forEach((level2) => {
//         if (part === removeVietnameseTones(level2.name)) {
//           part = level2.name;
//         }
//       });

//       level3CategoriesCourse.forEach((level3) => {
//         if (part === removeVietnameseTones(level3.name)) {
//           part = level3.name;
//         }
//       });


//       level1Categories.forEach((level1) => {
//         if (part === removeVietnameseTones(level1.name)) {
//           part = level1.name;
//         }
//       });

//       level2Categories.forEach((level2) => {
//         if (part === removeVietnameseTones(level2.name)) {
//           part = level2.name;
//         }
//       });

//       level3Categories.forEach((level3) => {
//         if (part === removeVietnameseTones(level3.name)) {
//           part = level3.name;
//         }
//       });


//       const path = `/${pathnames.slice(0, index + 1).join("/")}`; 
//       let breadcrumbLabel = part;
//       if (part === "khoa-hoc") {
//         breadcrumbLabel = "Khoá học";
//       } else if (part === "tai-lieu") {
//         breadcrumbLabel = "Tài liệu";
//       } else if (part === "de-thi") {
//         breadcrumbLabel = "Đề thi";
//       } else if (part === "bai-viet") {
//         breadcrumbLabel = "Bài viết";
//       } else if (part === "ho-tro") {
//         breadcrumbLabel = "Hỗ trợ";
//       } else if (part === "notification-all") {
//         breadcrumbLabel = "Thông báo";
//       } else if (part === "gio-hang") {
//         breadcrumbLabel = "Giỏ hàng";
//       } else if (part === "danh-muc-bai-viet") {
//         breadcrumbLabel = "Danh mục bài viết";
//       }
//       // Thêm breadcrumb item
//       breadcrumbItems.push(
//         <li
//           key={part}
//           className={`breadcrumb-item ${
//             index === pathnames.length - 1 ? "active" : ""
//           }`}
//         >
//           {index === pathnames.length - 1 ? (
//             breadcrumbLabel
//           ) : (
//             <a href={path}>{breadcrumbLabel}</a>
//           )}
//         </li>
//       );
//     });

//     return breadcrumbItems;
//   };

//   return (
//     <div className="p-1 breadcrumb_header">
//       <div className="container">
//         <div className="page-header">
//           <ol className="breadcrumb">{createBreadcrumb()}</ol>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Breadcum;
