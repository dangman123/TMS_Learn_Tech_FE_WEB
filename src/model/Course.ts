// src/models/Course.ts

export interface Course {
    id: number;
    id_danhmuc: number;
    title: string;
    imageUrl: string;
    price: number; 
    cost: number; 
    numberOfStudents: number;
    totalLessons: number;
    averageRating: number; 
    type : string;
    status : boolean;
  }
  