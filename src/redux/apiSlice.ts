import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    Course,
    Module,
    CourseLesson,
    CourseAssessment,
    AssessmentQuestion,
    QuestionOption,
    CourseMaterial,
    CourseFormData,
    CoursePayload,
    LessonFormData,
    AssessmentFormData,
    QuestionFormData
} from '../types';

// Base query with token handling
const baseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8091',
    prepareHeaders: (headers) => {
        // Try multiple localStorage keys for JWT token
        const token = localStorage.getItem('ans-sms.token') ||
            localStorage.getItem('ans-sms.jwt') ||
            localStorage.getItem('ans-sms.accessToken') ||
            localStorage.getItem('token') ||
            localStorage.getItem('jwt');

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['Course', 'Module', 'CourseLesson', 'CourseAssessment', 'AssessmentQuestion', 'QuestionOption', 'CourseMaterial'],
    endpoints: (builder) => ({
        // Course endpoints
        getCourses: builder.query<Course[], void>({
            query: () => '/courses',
            providesTags: ['Course'],
        }),
        getPublishedCourses: builder.query<Course[], void>({
            query: () => '/courses/published',
            providesTags: ['Course'],
        }),
        getCompletedCourses: builder.query<Course[], void>({
            query: () => '/courses/completed',
            providesTags: ['Course'],
        }),
        getCourseById: builder.query<Course, number>({
            query: (id) => `/course/${id}`,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        createCourse: builder.mutation<Course, CoursePayload>({
            query: (course) => ({
                url: '/courses',
                method: 'POST',
                body: course,
            }),
            invalidatesTags: ['Course'],
        }),
        updateCourse: builder.mutation<Course, { id: number; updates: Partial<CoursePayload> }>({
            query: ({ id, updates }) => ({
                url: `/courses/${id}`,
                method: 'PUT',
                body: updates,
            }),
            // Invalidate the list to trigger refetch of the dashboard
            invalidatesTags: ['Course'],
            async onQueryStarted({ id, updates }, { dispatch, queryFulfilled }) {
                // Optimistically update the getCourses cache so the UI updates instantly
                const patchResult = dispatch(
                    apiSlice.util.updateQueryData('getCourses', undefined, (draft) => {
                        const index = draft.findIndex((c) => c.id === id);
                        if (index !== -1) {
                            Object.assign(draft[index], updates as Partial<Course>);
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        publishCourse: builder.mutation<Course, number>({
            query: (id) => ({
                url: `/courses/${id}/publish`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Course'],
        }),
        deactivateCourse: builder.mutation<Course, number>({
            query: (id) => ({
                url: `/courses/${id}/deactivate`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Course'],
        }),
        deleteCourse: builder.mutation<string, number>({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Course'],
        }),

        // Module endpoints
        getModulesByCourse: builder.query<Module[], number>({
            query: (courseId) => `/modules/course/${courseId}`,
            providesTags: ['Module'],
        }),
        createModule: builder.mutation<Module, { name: string; description: string; course: { id: number } }>({
            query: (module) => ({
                url: '/modules',
                method: 'POST',
                body: module,
            }),
            invalidatesTags: ['Module'],
        }),
        updateModule: builder.mutation<Module, { id: number; updates: Partial<Module> }>({
            query: ({ id, updates }) => ({
                url: `/modules/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Module'],
        }),
        deleteModule: builder.mutation<string, number>({
            query: (id) => ({
                url: `/modules/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Module'],
        }),

        // Lesson endpoints
        getLessonsByCourse: builder.query<CourseLesson[], number>({
            query: (courseId) => `/course-lessons/course/${courseId}`,
            providesTags: (result, error, courseId) => [{ type: 'CourseLesson', courseId }],
        }),
        createLesson: builder.mutation<CourseLesson, LessonFormData & { course: { id: number }; module?: { id: number } }>({
            query: (lesson) => ({
                url: '/course-lessons',
                method: 'POST',
                body: lesson,
            }),
            invalidatesTags: ['CourseLesson'],
        }),
        updateLesson: builder.mutation<CourseLesson, { id: number; updates: Partial<LessonFormData> }>({
            query: ({ id, updates }) => ({
                url: `/course-lessons/${id}`,
                method: 'PUT',
                body: updates,
            }),
            // Invalidate all CourseLesson queries to refetch the list immediately
            invalidatesTags: ['CourseLesson'],
        }),
        deleteLesson: builder.mutation<string, number>({
            query: (id) => ({
                url: `/course-lessons/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CourseLesson'],
        }),

        // Assessment endpoints
        getAssessmentsByCourse: builder.query<CourseAssessment[], number>({
            query: (courseId) => `/assessments/course/${courseId}`,
            providesTags: (result, error, courseId) => [{ type: 'CourseAssessment', courseId }],
        }),
        getStandaloneAssessments: builder.query<CourseAssessment[], void>({
            query: () => '/assessments/standalone',
            providesTags: ['CourseAssessment'],
        }),
        createAssessment: builder.mutation<CourseAssessment, AssessmentFormData & { course?: { id: number } }>({
            query: (assessment) => ({
                url: '/assessments',
                method: 'POST',
                body: assessment,
            }),
            invalidatesTags: ['CourseAssessment'],
        }),
        updateAssessment: builder.mutation<CourseAssessment, { id: number; updates: Partial<AssessmentFormData> }>({
            query: ({ id, updates }) => ({
                url: `/assessments/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'CourseAssessment', id }],
        }),
        deleteAssessment: builder.mutation<string, number>({
            query: (id) => ({
                url: `/assessments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CourseAssessment'],
        }),

        // Question endpoints
        getQuestionsByAssessment: builder.query<AssessmentQuestion[], number>({
            query: (assessmentId) => `/assessment-questions/assessment/${assessmentId}`,
            providesTags: (result, error, assessmentId) => [{ type: 'AssessmentQuestion', assessmentId }],
        }),
        createQuestion: builder.mutation<AssessmentQuestion, QuestionFormData & { assessment: { id: number } }>({
            query: (question) => ({
                url: '/assessment-questions',
                method: 'POST',
                body: question,
            }),
            invalidatesTags: ['AssessmentQuestion'],
        }),
        updateQuestion: builder.mutation<AssessmentQuestion, { id: number; updates: Partial<QuestionFormData> }>({
            query: ({ id, updates }) => ({
                url: `/assessment-questions/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'AssessmentQuestion', id }],
        }),
        deleteQuestion: builder.mutation<string, number>({
            query: (id) => ({
                url: `/assessment-questions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AssessmentQuestion'],
        }),

        // Question Option endpoints
        getOptionsByQuestion: builder.query<QuestionOption[], number>({
            query: (questionId) => `/question-options/question/${questionId}`,
            providesTags: (result, error, questionId) => [{ type: 'QuestionOption', questionId }],
        }),
        createOption: builder.mutation<QuestionOption, { optionText: string; question: { id: number } }>({
            query: (option) => ({
                url: '/question-options',
                method: 'POST',
                body: option,
            }),
            invalidatesTags: ['QuestionOption'],
        }),
        createBulkOptions: builder.mutation<{ message: string }, { optionText: string; question: { id: number } }[]>({
            query: (options) => ({
                url: '/question-options/bulk',
                method: 'POST',
                body: options,
            }),
            invalidatesTags: ['QuestionOption'],
        }),
        updateOption: builder.mutation<QuestionOption, { id: number; updates: Partial<QuestionOption> }>({
            query: ({ id, updates }) => ({
                url: `/question-options/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'QuestionOption', id }],
        }),
        deleteOption: builder.mutation<string, number>({
            query: (id) => ({
                url: `/question-options/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['QuestionOption'],
        }),

        // Material endpoints
        getMaterialsByCourse: builder.query<CourseMaterial[], number>({
            query: (courseId) => `/course-materials/course/${courseId}`,
            providesTags: ['CourseMaterial'],
        }),
        createMaterial: builder.mutation<CourseMaterial, Omit<CourseMaterial, 'id' | 'createdAt' | 'updatedAt'> & { course: { id: number } }>({
            query: (material) => ({
                url: '/course-materials',
                method: 'POST',
                body: material,
            }),
            invalidatesTags: ['CourseMaterial'],
        }),
        uploadMaterial: builder.mutation<CourseMaterial, FormData>({
            query: (formData) => ({
                url: '/course-materials/upload',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['CourseMaterial'],
        }),
        updateMaterial: builder.mutation<CourseMaterial, { id: number; updates: Partial<CourseMaterial> }>({
            query: ({ id, updates }) => ({
                url: `/course-materials/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'CourseMaterial', id }],
        }),
        deleteMaterial: builder.mutation<string, number>({
            query: (id) => ({
                url: `/course-materials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CourseMaterial'],
        }),
    }),
});

// Export hooks for usage in functional components
export const {
    // Course hooks
    useGetCoursesQuery,
    useGetPublishedCoursesQuery,
    useGetCompletedCoursesQuery,
    useGetCourseByIdQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    usePublishCourseMutation,
    useDeactivateCourseMutation,
    useDeleteCourseMutation,

    // Module hooks
    useGetModulesByCourseQuery,
    useCreateModuleMutation,
    useUpdateModuleMutation,
    useDeleteModuleMutation,

    // Lesson hooks
    useGetLessonsByCourseQuery,
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation,

    // Assessment hooks
    useGetAssessmentsByCourseQuery,
    useGetStandaloneAssessmentsQuery,
    useCreateAssessmentMutation,
    useUpdateAssessmentMutation,
    useDeleteAssessmentMutation,

    // Question hooks
    useGetQuestionsByAssessmentQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,

    // Question Option hooks
    useGetOptionsByQuestionQuery,
    useCreateOptionMutation,
    useCreateBulkOptionsMutation,
    useUpdateOptionMutation,
    useDeleteOptionMutation,

    // Material hooks
    useGetMaterialsByCourseQuery,
    useCreateMaterialMutation,
    useUploadMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialMutation,
} = apiSlice;
