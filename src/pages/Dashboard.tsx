import { Route, Routes } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import RoleSidebar from "@/components/dashboard/RoleSidebar";
import AdminDashboard from "@/components/dashboard/admin/AdminDashboard";
import ManageUsers from "@/components/dashboard/admin/ManageUsers";
import ManageColleges from "@/components/dashboard/admin/ManageColleges";
import ManageCourses from "@/components/dashboard/admin/ManageCourses";
import ManageStudents from "@/components/dashboard/admin/ManageStudents";
import AdminPredictions from "@/components/dashboard/admin/AdminPredictions";
import AdminAnalytics from "@/components/dashboard/admin/AdminAnalytics";
import AdminNotifications from "@/components/dashboard/admin/AdminNotifications";
import AdminSettings from "@/components/dashboard/admin/AdminSettings";
import TeacherDashboard from "@/components/dashboard/teacher/TeacherDashboard";
import TeacherStudents from "@/components/dashboard/teacher/TeacherStudents";
import TeacherAttendance from "@/components/dashboard/teacher/TeacherAttendance";
import TeacherMarks from "@/components/dashboard/teacher/TeacherMarks";
import TeacherPredictions from "@/components/dashboard/teacher/TeacherPredictions";
import TeacherAlerts from "@/components/dashboard/teacher/TeacherAlerts";
import TeacherFeedback from "@/components/dashboard/teacher/TeacherFeedback";
import StudentDashboard from "@/components/dashboard/student/StudentDashboard";
import StudentProfile from "@/components/dashboard/student/StudentProfile";
import StudentAttendance from "@/components/dashboard/student/StudentAttendance";
import StudentMarks from "@/components/dashboard/student/StudentMarks";
import StudentPerformance from "@/components/dashboard/student/StudentPerformance";
import StudentFeedback from "@/components/dashboard/student/StudentFeedback";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading || !user || !role) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email || "User";

  return (
    <div className="flex min-h-screen bg-background">
      <RoleSidebar role={role} userName={userName} />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          {role === "admin" && (
            <>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="colleges" element={<ManageColleges />} />
              <Route path="courses" element={<ManageCourses />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="predictions" element={<AdminPredictions />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </>
          )}
          {role === "teacher" && (
            <>
              <Route index element={<TeacherDashboard />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="marks" element={<TeacherMarks />} />
              <Route path="predictions" element={<TeacherPredictions />} />
              <Route path="alerts" element={<TeacherAlerts />} />
              <Route path="feedback" element={<TeacherFeedback />} />
            </>
          )}
          {role === "student" && (
            <>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="marks" element={<StudentMarks />} />
              <Route path="performance" element={<StudentPerformance />} />
              <Route path="feedback" element={<StudentFeedback />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
