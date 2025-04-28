export interface CourseList {
    id: number;
    title: string;
    imageUrl?: string;
    duration: string;
    price: number;
    cost:number;
    averageRating: number;
    totalLessons:number
    numberOfStudents: number;
    reviewCount?: number;
    author: string;
    course_output: string;
    created_at: Date;
    updated_at: Date;
    description: string;
    language: string;
    status: boolean;
    type:string;
    id_danhmuc?: number; 
}
