import { Routes, Route } from "react-router-dom";
import { ConfigBanner } from "@/components/ConfigBanner";
import PublicLayout from "@/routes/PublicLayout";
import AppLayout from "@/routes/AppLayout";
import { RequireAuth, RequireRole } from "@/routes/guards";
import RoleRedirect from "@/routes/RoleRedirect";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import OnboardInstitutePage from "@/features/auth/OnboardInstitutePage";
import CatalogPage from "@/features/public/CatalogPage";
import CourseDetailPage from "@/features/public/CourseDetailPage";
import AdminDashboardPage from "@/features/admin/AdminDashboardPage";
import CoursesListPage from "@/features/admin/CoursesListPage";
import CourseCreatePage from "@/features/admin/CourseCreatePage";
import CourseBuilderPage from "@/features/admin/CourseBuilderPage";
import FacultyPage from "@/features/admin/FacultyPage";
import StudentsPage from "@/features/admin/StudentsPage";
import BatchesPage from "@/features/admin/BatchesPage";
import SettingsPage from "@/features/admin/SettingsPage";
import FacultyDashboardPage from "@/features/faculty/FacultyDashboardPage";
import FacultyCoursesPage from "@/features/faculty/FacultyCoursesPage";
import FacultyLivePage from "@/features/faculty/FacultyLivePage";
import StudentDashboardPage from "@/features/student/StudentDashboardPage";
import MyCoursesPage from "@/features/student/MyCoursesPage";
import CoursePlayerPage from "@/features/student/CoursePlayerPage";

export default function App() {
  return (
    <>
      <ConfigBanner />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="onboard" element={<OnboardInstitutePage />} />

        <Route path="app" element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<RoleRedirect />} />

            <Route path="admin" element={<RequireRole allow={["institute_admin", "super_admin", "support"]} />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="courses" element={<CoursesListPage />} />
              <Route path="courses/new" element={<CourseCreatePage />} />
              <Route path="courses/:courseId" element={<CourseBuilderPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="batches" element={<BatchesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="faculty" element={<RequireRole allow={["faculty"]} />}>
              <Route index element={<FacultyDashboardPage />} />
              <Route path="courses" element={<FacultyCoursesPage />} />
              <Route path="courses/:courseId" element={<CoursePlayerPage />} />
              <Route path="live" element={<FacultyLivePage />} />
            </Route>

            <Route path="student" element={<RequireRole allow={["student", "parent"]} />}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="courses" element={<MyCoursesPage />} />
              <Route path="courses/:courseId" element={<CoursePlayerPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function NotFound() {
  return <div className="flex min-h-screen items-center justify-center">Page not found.</div>;
}
