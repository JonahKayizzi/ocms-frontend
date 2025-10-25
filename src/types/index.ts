// Course types
export interface Course {
    id: number;
    name: string;
    description: string;
    learningGoals: string;
    objectives: string;
    startDate: string;
    endDate: string;
    status: number;
    createdAt: string;
    updatedAt: string;
}

// Module types
export interface Module {
    id: number;
    name: string;
    description: string;
    courseId: number;
    createdAt: string;
    updatedAt: string;
}

// Lesson types
export interface CourseLesson {
    id: number;
    name: string;
    description: string;
    content: string;
    loomVideoUrl: string;
    courseId: number;
    moduleId?: number;
    createdAt: string;
    updatedAt: string;
}

// Assessment types
export interface CourseAssessment {
    id: number;
    name: string;
    description: string;
    questionsToPresent: number;
    questionCount: number;
    courseId?: number;
    showAnswers: boolean;
    maxRetries: number;
    timingMode: 'none' | 'quiz' | 'question';
    timeLimit: number; // in minutes for quiz mode, seconds for question mode
    status: number;
    createdAt: string;
    updatedAt: string;
}

// Question types
export interface AssessmentQuestion {
    id: number;
    text: string;
    // correctOptionId removed - now using is_correct in QuestionOption
    optionsToPresent: number;
    imageDataUrl: string;
    assessmentId: number;
    createdAt: string;
    updatedAt: string;
}

// Question Option types
export interface QuestionOption {
    id: number;
    optionText: string;
    questionId: number;
    isCorrect: boolean;
    createdAt: string;
    updatedAt: string;
}

// Material types
export interface CourseMaterial {
    id: number;
    name: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    courseId: number;
    status: number;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

// Form types
export interface CourseFormData {
    name: string;
    description: string;
    learningGoals: string;
    objectives: string;
    startDate: string; // form state keeps strings
    endDate: string;   // form state keeps strings
}

// Payload types that allow nulls for optional dates when sending to backend
export type CoursePayload = Omit<CourseFormData, 'startDate' | 'endDate'> & {
    startDate: string | null;
    endDate: string | null;
};

export interface LessonFormData {
    name: string;
    description: string;
    content: string;
    loomVideoUrl: string;
    moduleId?: number;
}

export interface AssessmentFormData {
    name: string;
    description: string;
    questionsToPresent: number;
    questionCount: number;
    showAnswers: boolean;
    maxRetries: number;
    timingMode: 'none' | 'quiz' | 'question';
    timeLimit: number;
    courseId?: number;
}

export interface QuestionFormData {
    text: string;
    // correctOptionId removed - now using is_correct in QuestionOption
    optionsToPresent: number;
    imageDataUrl: string;
    assessmentId: number;
}

// Status constants
export const COURSE_STATUS = {
    DEACTIVATED: 0,
    PUBLISHED: 1,
    DRAFT: 2,
    COMPLETED: 3,
} as const;

export type CourseStatus = typeof COURSE_STATUS[keyof typeof COURSE_STATUS];
