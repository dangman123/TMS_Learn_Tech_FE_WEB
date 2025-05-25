export interface ExamList {
  testId: number;
  title: string;
  description: string;
  totalQuestion: number;
  courseId: number;
  courseTitle: string;
  author: string;
  itemCountPrice: number;
  itemCountReview: number;
  rating: number;
  imageUrl: string;
  duration: number;
  level: string;
  examType: string;
  status: string;
  price: number;
  cost: number;
  percentDiscount: number;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiResponse {
  status: number;
  message: string;
  data: {
    totalElements: number;
    totalPages: number;
    pageable: PageableInfo;
    size: number;
    content: ExamList[];
    number: number;
    sort: {
      sorted: boolean;
      empty: boolean;
      unsorted: boolean;
    };
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}
