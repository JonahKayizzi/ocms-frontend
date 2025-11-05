import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { store } from "./redux/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import HomePage from "./pages/HomePage";
import UserDashboard from "./pages/UserDashboard";
import CourseManagementDashboard from "./private/pages/publicContent/online-courses/course-management-dashboard";
import LoginPage from "./pages/LoginPage";
// Original app views (preserved names/structure)
import CoursePage from "./public/components/online-course-page/course-page";
import CourseOutline from "./public/components/online-course-page/course-outline";
import DownloadableMaterials from "./public/components/online-course-page/downloadable-materials";
import VideoSection from "./public/components/online-course-page/video-section";
import QuizAssessment from "./public/components/online-obj-assessment/quiz-assessment";
import courseData from "./public/components/online-course-page/data/course-data";
import "./index.css";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<CourseManagementDashboard />} />
              {/* Legacy aliases for admin dashboard */}
              <Route
                path="/online-course/dashboard"
                element={<CourseManagementDashboard />}
              />
              <Route
                path="/online-obj-assessment/dashboard"
                element={<CourseManagementDashboard />}
              />
              {/* Use legacy CoursePage for public course view (same design as SMS) */}
              <Route path="/course/:id" element={<CoursePage />} />
              {/* Original routes */}
              <Route path="/course/:id/legacy" element={<CoursePage />} />
              <Route
                path="/course/:id/outline"
                element={<CourseOutline modules={courseData.modules} />}
              />
              <Route
                path="/course/:id/materials"
                element={
                  <DownloadableMaterials materials={courseData.materials} />
                }
              />
              <Route
                path="/course/:id/video"
                element={
                  <VideoSection
                    currentLesson={courseData.progress.currentLesson}
                    currentLessonNumber={
                      courseData.progress.currentLessonNumber
                    }
                    totalLessons={courseData.progress.totalLessons}
                    loomVideoUrl={""}
                    contentHtml={""}
                  />
                }
              />
              <Route path="/assessment/:id" element={<QuizAssessment />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
