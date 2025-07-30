
export interface Student {
  _id?: string;
  id: number; // Custom auto-incrementing ID
  name: string;
  dob: string; 
  profilePictureUrl: string;
  classId: string | null;
}

export interface Subject {
  _id: string;
  id: string; // Legacy from original type, now matches _id
  name: string;
}

export interface Class {
  _id: string;
  name:string;
  subjects: Subject[];
}

export interface Exam {
  _id: string;
  name: string;
  date: string;
  isPublished: boolean;
  classId: string;
}

export interface Mark {
  _id?: string;
  studentId: number; // Refers to Student.id
  examId: string;
  subjectId: string;
  marks: number | null;
}

export interface Result {
    student: Student;
    exam: Exam;
    class: Class;
    marks: { subjectName: string; marks: number | null }[];
    totalMarks: number;
    percentage: number;
    allSubjectsPerfect: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalExams: number;
  publishedResults: number;
}
