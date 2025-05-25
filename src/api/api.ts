import React from "react";

const username = "thanhngoc@gmail.com";
const password = "Thanh1309@";
export const token_default = btoa(`${username}:${password}`); // Mã hóa Base64
// export const SERVER = `${process.env.REACT_APP_SERVER_HOST}`;

//ADMIN
export const GET_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/accounts`;
export const POST_ADMIN_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/documents`;
export const POST_ACCOUNT_REGISTER = `${process.env.REACT_APP_SERVER_HOST}/account/dang-ky`;
export const POST_ACCOUNT_LOGIN = `${process.env.REACT_APP_SERVER_HOST}/account/dang-nhap`;

//ADMIN_DOCUMENT
export const ADMIN_DOCUMENT_GET_CATEGORY_LEVEL1 = `${process.env.REACT_APP_SERVER_HOST}/categories/level1`;
export const ADMIN_DOCUMENT_GET_CATEGORY_LEVEL2 = `${process.env.REACT_APP_SERVER_HOST}/categories/level2`;
export const ADMIN_DOCUMENT_GET_CATEGORY_LEVEL3 = `${process.env.REACT_APP_SERVER_HOST}/categories/level3`;

export const ADMIN_STATUS_GeneralDocument = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/status`;
export const ADMIN_UNSTATUS_GeneralDocument = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/unstatus`;

export const ADMIN_GET_ONE_DOCUMENT = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/generaldocuments-details/${id}`;
export const ADMIN_GET_NAME_CATEGORY = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/name-by-id?id_category=${id}`;
export const ADMIN_GET_CATEGORY_PARENT_ID = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/categories_parent_id?id_category=${id}`;
export const ADMIN_GET_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/documents-with-categories`;
export const ADMIN_POST_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/upload`;
export const ADMIN_UPDATE_DOCUMENT = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/generaldocuments-update/${id}`;
export const ADMIN_DELETE_DOCUMENT = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/generaldocuments/${id}`;
export const ADMIN_HIDE_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/hide`;
export const ADMIN_SHOW_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/show`;
//ADMIN_CATEGORIES

//Field
export const ADMIN_CATEGORY_GET_LEVEL1 = `${process.env.REACT_APP_SERVER_HOST}/categories/level1`;
export const ADMIN_CATEGORY_GET_ONE_FIELD = `${process.env.REACT_APP_SERVER_HOST}/categorys`;
export const ADMIN_UPDATE_FIELD = `${process.env.REACT_APP_SERVER_HOST}/categorys`;
export const ADMIN_POST_FIELD = `${process.env.REACT_APP_SERVER_HOST}/categorys`;

//Branch
export const ADMIN_CATEGORY_GET_LEVEL2 = `${process.env.REACT_APP_SERVER_HOST}/categories/level2`;
export const ADMIN_CATEGORY_GET_ONE_BRANCH = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/name-by-id?id_category=${id}`;
export const ADMIN_SUBJECT_GET_CATEGORY_PARENT_ID = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/categories_parent_id?id_category=${id}`;
export const ADMIN_UPDATE_BRANCH = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/update-branch/${id}`;
export const ADMIN_POST_BRANCH = `${process.env.REACT_APP_SERVER_HOST}/add-branch`;

//Subject
export const ADMIN_CATEGORY_GET_LEVEL3 = `${process.env.REACT_APP_SERVER_HOST}/categories/level3`;
export const ADMIN_GET_CATEGORY_PARENT_ID2 = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/categories_parent_id2?parentId=${id}`;
export const ADMIN_CATEGORY_GET_ONE_SUBJECT = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/name-by-id?id_category=${id}`;
export const ADMIN_UPDATE_SUBJECT = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/update-branch/${id}`;
export const ADMIN_POST_SUBJECT = `${process.env.REACT_APP_SERVER_HOST}/add-branch`;
export const ADMIN_DELETE_SUBJECT = `${process.env.REACT_APP_SERVER_HOST}/categorys`;
//ADMIN_BLOG_CATEGORY
export const ADMIN_GET_CATEGORY_BLOG = `${process.env.REACT_APP_SERVER_HOST}/blogcategorys`;
export const ADMIN_GET_ONE_CATEGORY_BLOG = `${process.env.REACT_APP_SERVER_HOST}/blogcategorys`;
export const ADMIN_POST_CATEGORY_BLOG = `${process.env.REACT_APP_SERVER_HOST}/blogcategorys`;
export const ADMIN_DELETE_CATEGORY_BLOG = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/blogcategorys/${id}`;

export const ADMIN_UPDATE_CATEGORY_BLOG = `${process.env.REACT_APP_SERVER_HOST}/blogcategorys`;

//ADMIN_CATEGORIES_COURSE
export const ADMIN_GET_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;
export const ADMIN_GET_ONE_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;
export const ADMIN_POST_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;
export const ADMIN_DELETE_CATEGORY_COURSE = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/course_categories/${id}`;
export const ADMIN_UPDATE_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;

//ADMIN_COURSE
export const ADMIN_GET_COURSE_JPA = `${process.env.REACT_APP_SERVER_HOST}/courses`;
export const ADMIN_GET_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/getall`;
export const ADMIN_GET_ONE_COURSE = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/courses/${id}`;
export const ADMIN_GET_CHAPTER = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/chapters/course/${id}`;
export const ADMIN_POST_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/add`;
export const ADMIN_POST_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/add`;
export const ADMIN_DELETE_LESSON = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/lessons/${id}`;
export const ADMIN_POST_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/add-course`;
export const ADMIN_UPDATE_COURSE = (courseId: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/update-course/${courseId}`;
export const ADMIN_COURSE_GET_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;

export const ADMIN_UPDATE_CHAPTER = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/chapters/edit/${id}`;
export const ADMIN_PUT_DELETE_COURSE_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/courses/delete`;
// export const ADMIN_PUT_ACTIVE_COURSE_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/courses/active`;

export const ADMIN_lock_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/lock`;
export const ADMIN_Unlock_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/unlock`;
export const ADMIN_SHOW_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/show`;
export const ADMIN_HIDE_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/hide`;
//ADMIN_QUESTION
export const ADMIN_GET_QUESTION = (page: number, rowsPerPage: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/questions/all?page=${page}&size=${rowsPerPage}`;
// export const ADMIN_GET_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/questions`;
// export const ADMIN_GET_ONE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/questions`;
export const ADMIN_GET_ONE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/detail`;
export const ADMIN_EXPORT_QUESTION_EXCEL = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export/excel-list`;
export const ADMIN_EXPORT_QUESTION_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export/docx-list`;
// export const ADMIN_EXPORT_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export/excel`;

export const ADMIN_ADD_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/add`;
export const ADMIN_EDIT_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/update`;
export const ADMIN_HIDE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/hide`;
export const ADMIN_SHOW_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/show`;
export const ADMIN_DELETE_QUESTION = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/questions/${id}`;
export const ADMIN_DELETE_CHOOSE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions`;
export const ADMIN_POST_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/upload`;
export const ADMIN_POST_QUESTION_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/questions/upload-docx`;

//ADMIN_LESSON
// export const ADMIN_GET_LESSONS = `${process.env.REACT_APP_SERVER_HOST}/lessons`;
export const ADMIN_GET_CB_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/ofaccount/list`;
export const ADMIN_GET_CB_COURSE1 = `${process.env.REACT_APP_SERVER_HOST}/api/courses/getall-list`;
export const ADMIN_GET_LESSONS = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/getall`;
export const ADMIN_GET_LESSONS_ADMIN = `${process.env.REACT_APP_SERVER_HOST}/api/lessons`;

export const ADMIN_PUT_DELETE_LESSON = (lessonId: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/lessons/delete/${lessonId}`;
export const ADMIN_PUT_ACTIVE_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/active`;
export const ADMIN_PUT_LOCK_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/lock`;
export const ADMIN_PUT_UNLOCK_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/unlock`;

export const ADMIN_ADD_TEST_TO_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/tests/update-to-lesson`;
export const ADMIN_GET_TEST_RESULT_CHECK_COUNT = `${process.env.REACT_APP_SERVER_HOST}/api/test-results/check-count-test`;
export const ADMIN_PUT_TEST_UPDATE_NOT_TEST = (testId: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/tests/update-not-test/${testId}`;

export const ADMIN_POST_LESSONS_ADD = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/add`;
export const ADMIN_POST_LESSONS_UPDATE_VIDEO_ALL = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/updateLessonWithVideoAll`;
export const ADMIN_POST_LESSONS_UPDATE_VIDEO_ADD = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/updateLessonWithVideo`;
export const ADMIN_POST_LESSONS_UPDATE_VIDEO_UPDATE = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/updateLessonWithVideoOrDocument`;
export const ADMIN_POST_LESSONS_UPDATE_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/update-lesson-video`;

export const ADMIN_POST_LESSONS = `${process.env.REACT_APP_SERVER_HOST}/lessons`;
export const ADMIN_DELETE_LESSONS = `${process.env.REACT_APP_SERVER_HOST}/lessons`;
export const ADMIN_GET_CHAPTERS = `${process.env.REACT_APP_SERVER_HOST}/chapters`;
export const ADMIN_GET_CHAPTERS_LIST = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/admin-all`;

export const ADMIN_UPLOAD_VIDEO = `${process.env.REACT_APP_SERVER_HOST}/chapters`;
export const ADMIN_GET_CHAPTER_ALL = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/admin-all`;

//ADMIN_ACCOUNT
export const ADMIN_GET_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/account/admin`;
export const ADMIN_GET_ACCOUNT_LIST = `${process.env.REACT_APP_SERVER_HOST}/accounts`;
export const ADMIN_UPDATE_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/account/admin`;
export const ADMIN_ADD_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/account/admin/add`;
export const ADMIN_GET_ACCOUNT_TEACHER = `${process.env.REACT_APP_SERVER_HOST}/api/account/list-teacher`;
//ADMIN_TEST

export const ADMIN_GET_TEST_JPA = `${process.env.REACT_APP_SERVER_HOST}/tests`;
export const ADMIN_GET_TEST_LIST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/getall-list`;
export const ADMIN_GET_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/getall`;
export const ADMIN_ADD_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/add`;
export const ADMIN_ADD_LIST_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/add-list`;
export const ADMIN_ADD_LIST_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/tests/add-list-exam`;
export const ADMIN_ADD_LIST_EXAM_PREPARATION = (
  chapterId: number,
  estimate: number
) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/tests/add-list-exam-preparation?chapterId=${chapterId}&estimate=${estimate}`;
export const ADMIN_ADD_QUESTION_TO_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/add-questions`;
export const ADMIN_ADD_QUESTION_TO_TEST_V2 = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/add-questions-v2`;
export const ADMIN_GET_ONE_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/chitiet`;

export const ADMIN_PUT_DELETE_TEST_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/tests/delete`;
export const ADMIN_PUT_ACTIVE_TEST_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/tests/active`;

export const ADMIN_UPDATE_TEST = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/tests/${id}`;
export const ADMIN_QUESTION_OF_TEST = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/questions/tests/questions/${id}`;
//ADMIN_PAYMENT
export const ADMIN_GET_PAYMENT = `${process.env.REACT_APP_SERVER_HOST}/api/payments/all`;
export const ADMIN_GET_PAYMENTDETAIL = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/payment-details/admin/${id}`;
export const ADMIN_DELETE_PAYMENT = `${process.env.REACT_APP_SERVER_HOST}/payments`;

export const ADMIN_UPDATE_PAYMENT = `${process.env.REACT_APP_SERVER_HOST}/payments`;
//ADMIN_COMMENT
export const ADMIN_GET_COMNENT = `${process.env.REACT_APP_SERVER_HOST}/api/comments/getall`;
export const ADMIN_HIDE_COMMENT = `${process.env.REACT_APP_SERVER_HOST}/api/comments/hide`;
export const ADMIN_SHOW_COMMENT = `${process.env.REACT_APP_SERVER_HOST}/api/comments/show`;
export const ADMIN_UNACTIVE_COMNENT = `${process.env.REACT_APP_SERVER_HOST}/api/comments/unactive`;
export const ADMIN_ACTIVE_COMNENT = `${process.env.REACT_APP_SERVER_HOST}/api/comments/active`;
//ADMIN_RESULT
export const ADMIN_GET_COURSE_OF_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/ofaccount`;
export const ADMIN_GETALL_RESULT = `${process.env.REACT_APP_SERVER_HOST}/api/courses/getallresult`;
//ADMIN_DISCOUNT
export const ADMIN_GET_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/getall`;
export const ADMIN_ADD_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/add`;
export const ADMIN_GET_DISCOUNT_BY_ID = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/detail`;
export const ADMIN_EDIT_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/update`;
export const ADMIN_COURSE_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/discounts`;
export const ADMIN_DISCOUNT_TO_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/course-discounts/add-discount`;
export const ADMIN_RESET_PRICE = `${process.env.REACT_APP_SERVER_HOST}/api/course-discounts/reset-price`;
export const ADMIN_HIDE_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/hide`;
export const ADMIN_SHOW_DISCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/show`;
//ADMIN_BLOG
export const ADMIN_GET_BLOG = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/admingetall`;
export const ADMIN_GET_ONE_BLOG = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/admin/detail`;
export const ADMIN_ADD_BLOG = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/admin/add`;
export const ADMIN_UPDATE_BLOG = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/admin/update`;
//ADMIN_Notification
export const ADMIN_GET_NOTIFICATION = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/getall`;
export const ADMIN_ADD_NOTIFICATION = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/getall`;

export const ADMIN_POST_NOTIFICATION_AND_SEND = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/notify`;
export const ADMIN_GET_NOTIFICATION_BY_ID = `${process.env.REACT_APP_SERVER_HOST}/notifications`;
export const ADMIN_UPDATE_NOTIFICATION = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/getall`;
export const ADMIN_HIDE_NOTIFICATION = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/hide`;
export const ADMIN_SHOW_NOTIFICATION = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/show`;
// export const ADMIN_POST_NOTIFICATION_AND_SEND = `${process.env.REACT_APP_SERVER_HOST}/api/notifications/show`;
export const ADMIN_ACCOFCOURSE = `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/accounts/courses`;

//Header
export const GET_USER_CATEGORY_LEVEL_1 = `${process.env.REACT_APP_SERVER_HOST}/categories/level1`;
export const GET_USER_CATEGORY_LEVEL_2 = `${process.env.REACT_APP_SERVER_HOST}/categories/level2`;
export const GET_USER_CATEGORY_LEVEL_3 = `${process.env.REACT_APP_SERVER_HOST}/categories/level3`;
// export const GET_USER_CATEGORY_COURSE = `${process.env.REACT_APP_SERVER_HOST}/course_categories`;

//HOME-PAGE
export const GET_USER_TOP6_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/top6`;
export const GET_USER_DOCUMENT_DOWNLOAD_DESC = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/download_desc`;
export const GET_USER_DOCUMENT_VIEW_DESC = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/view_desc`;
export const GET_USER_DOCUMENT_CREATE_DESC = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/create_desc`;

//Document-page
export const GET_USER_DOCUMENT_PAGE = (page: number, size: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/all-general-document?page=${page}&size=${size}`;
export const GET_USER_CATEGORY_DOCUMENT = `${process.env.REACT_APP_SERVER_HOST}/categories-all`;
export const GET_USER_DOCUMENT_TOP6 = `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/view_desc/top6`;

// DOCUMENT_ DETAIL
export const GET_USER_DOCUMENT_DETAIL = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/generaldocuments/${id}`;
export const GET_USER_DOCUMENT_BY_CATEGORY_ID = (
  id: number,
  page: number,
  size: number
) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/public?categoryId=${id}&page=${page}&size=${size}`;

// COURSE
export const GET_USER_COURSE = (page: number, size: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses?page=${page}&size=${size}`;
export const GET_USER_COURSE_BY_CATEGORY_ID = (
  id: number,
  page: number,
  size: number
) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/category/${id}?page=${page}&size=${size}`;
export const GET_COURSES_BY_CATEGORIES = (
  categoryId: number,

) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/public/filter?type=category&categoryIds=${categoryId}`;
export const ADMIN_STATUS_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/status`;
export const ADMIN_UNSTATUS_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/unstatus`;
//EXAM
export const GET_USER_CATEGORY_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list-course`;
export const GET_USER_EXAM = (page: number, size: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/tests/exam/public?page=${page}&size=${size}`;
//COURSE - DETAIL
export const GET_USER_COURSE_DETAIL_BY_COURSE_ID = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/${id}`;
export const GET_USER_COURSE_DETAIL_TOTAL_LESSION = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/statistics/${id}`;
export const CHECK_ACTIVED_ENCROLLED_COURSE = () =>
  `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/check-enrollment`;
export const CHECK_TYPE_COURSE = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/courses/check-type/${id}`;

//SEARCH
export const GET_USER_SEARCH_DOCUMENT = (
  title: String,
  page: number,
  size: number
) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/search?title=${title}&page=${page}&size=${size}`;

//BLOG
export const GET_USER_BLOGS = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/public`;

//BLOG - DETAIL
export const GET_USER_BLOG_DETAIL = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/blogs/${id}`;
export const GET_USER_BLOGS_BY_CATGORY = (id: number) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/blogs/category/${id}`;
export const GET_USER_CATEGORY_BLOGS = `${process.env.REACT_APP_SERVER_HOST}/api/blog-category`;
export const GET_USER_BLOG_NEW = `${process.env.REACT_APP_SERVER_HOST}/api/blogs/newest`;
