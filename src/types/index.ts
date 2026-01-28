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
  department?: string; // Department field for filtering
  createdAt: string;
  updatedAt: string;
}

// Assessment Result types
export interface AssessmentResult {
  id: number;
  assessmentId: number;
  assessmentName?: string;
  courseId?: number;
  courseName?: string;
  participantId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  duration: number; // in seconds
  completedAt: string;
  answers?: Array<{
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }>;
}

export interface QuizAttemptAnswer {
  id?: number;
  questionId: number;
  questionText?: string;
  question?: {
    id: number;
    text: string;
    questionType?: "MCQ" | "structured";
  };
  questionType?: "multiple_choice" | "structured"; // Question type
  selectedOptionId?: number | null;
  selectedOptionText?: string | null;
  selectedAnswer?: number | string | null;
  selectedAnswerText?: string | null;
  structuredAnswer?: string | null; // Text answer for structured questions
  correctOptionId?: number | null;
  correctOptionText?: string | null;
  correctAnswerText?: string | null;
  isCorrect?: boolean;
  awardedMarks?: number | null; // Marks awarded by admin for structured questions
  maxMarks?: number | null; // Maximum marks for structured questions
}

export interface QuizAttempt {
  id: number;
  attemptNumber: number;
  participantId: string;
  participantName?: string;
  participant?: { username?: string; fullName?: string };
  quiz?: { id: number; name: string };
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  answers?: QuizAttemptAnswer[];
}

// User Progress types
export interface UserCourseProgress {
  courseId: number;
  courseName: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  lastAccessed: string;
  status: "not_started" | "in_progress" | "completed";
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
  timingMode: "none" | "quiz" | "question";
  timeLimit: number; // in minutes for quiz mode, seconds for question mode
  passMark: number; // Pass mark as percentage (e.g., 70 for 70%)
  isAim?: boolean; // True for AIM courses (MANSOPS reports), false for non-AIM courses
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
  questionType?: "multiple_choice" | "structured"; // New field for question type
  isMandatory?: boolean; // New field: true = mandatory, false = optional (can be randomly selected)
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
  endDate: string; // form state keeps strings
}

// Payload types that allow nulls for optional dates when sending to backend
export type CoursePayload = Omit<CourseFormData, "startDate" | "endDate"> & {
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
  timingMode: "none" | "quiz" | "question";
  timeLimit: number;
  passMark: number; // Pass mark as percentage
  isAim?: boolean; // True for AIM courses (MANSOPS reports), false for non-AIM courses
  courseId?: number;
}

export interface QuestionFormData {
  text: string;
  // correctOptionId removed - now using is_correct in QuestionOption
  optionsToPresent: number;
  imageDataUrl: string;
  assessmentId: number;
  questionType?: "multiple_choice" | "structured";
  isMandatory?: boolean;
}

// Status constants
export const COURSE_STATUS = {
  DEACTIVATED: 0,
  PUBLISHED: 1,
  DRAFT: 2,
  COMPLETED: 3,
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];
