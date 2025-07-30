
import type { Student, Class, Exam, Mark, Result, DashboardStats } from '../types';

const API_URL = 'http://localhost:5000/api'; // Using relative URL for proxying in production

const getAuthToken = () => localStorage.getItem('authToken');

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An unknown error occurred');
    }
    return response.json();
};

// Auth
export const login = async (password: string) => {
    const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password }),
    });
    return handleResponse(response);
};

// Student Functions
export const getStudents = (): Promise<Student[]> => {
    return fetch(`${API_URL}/students`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

export const addStudent = (formData: FormData): Promise<Student> => {
    return fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: formData,
    }).then(handleResponse);
};

export const updateStudent = (studentId: string, formData: FormData): Promise<Student> => {
    return fetch(`${API_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        body: formData,
    }).then(handleResponse);
};

export const deleteStudent = (studentId: string): Promise<void> => {
    return fetch(`${API_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

// Class Functions
export const getClasses = (): Promise<Class[]> => {
    return fetch(`${API_URL}/classes`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

export const addClass = (classData: { name: string }): Promise<Class> => {
    return fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(classData),
    }).then(handleResponse);
};

export const updateClass = (classId: string, classData: Partial<Class>): Promise<Class> => {
    return fetch(`${API_URL}/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(classData),
    }).then(handleResponse);
};

export const deleteClass = (classId: string): Promise<void> => {
    return fetch(`${API_URL}/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

// Exam Functions
export const getExams = (): Promise<Exam[]> => {
    return fetch(`${API_URL}/exams`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

export const addExam = (examData: Omit<Exam, '_id' | 'isPublished'>): Promise<Exam> => {
    return fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(examData),
    }).then(handleResponse);
};

export const updateExam = (examId: string, examData: Partial<Exam>): Promise<Exam> => {
    return fetch(`${API_URL}/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(examData),
    }).then(handleResponse);
};

export const deleteExam = (examId: string): Promise<void> => {
    return fetch(`${API_URL}/exams/${examId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

// Marks Functions
export const getMarksForExam = (examId: string): Promise<Mark[]> => {
    return fetch(`${API_URL}/marks/exam/${examId}`, {
         headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};

export const updateMark = (mark: Omit<Mark, '_id'>): Promise<Mark> => {
    return fetch(`${API_URL}/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(mark),
    }).then(handleResponse);
};

// Public Portal Function
export const findResult = (studentId: number, dob: string): Promise<Result | null> => {
    return fetch(`${API_URL}/portal/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, dob }),
    }).then(handleResponse);
};

export const getCollegeName = (): Promise<{ name: string }> => {
    return fetch(`${API_URL}/portal/college-name`).then(handleResponse);
};

export const setCollegeName = (name: string): Promise<void> => {
     return fetch(`${API_URL}/portal/college-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ name }),
    }).then(handleResponse);
};

export const getDashboardStats = (): Promise<DashboardStats> => {
    return fetch(`${API_URL}/portal/stats`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    }).then(handleResponse);
};
