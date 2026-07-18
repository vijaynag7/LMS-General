import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export function useAdminAnalytics() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["analytics", "admin", profile?.tenant_id],
    queryFn: async () => {
      const [paymentsRes, enrollmentsRes, attendanceRes] = await Promise.all([
        supabase.from("payments").select("amount, created_at, course_id, courses(title)").eq("status", "paid"),
        supabase.from("enrollments").select("id, student_id, course_id"),
        supabase.from("attendance").select("id, live_session_id"),
      ]);
      if (paymentsRes.error) throw paymentsRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (attendanceRes.error) throw attendanceRes.error;

      const payments = paymentsRes.data as unknown as { amount: number; created_at: string; course_id: string; courses: { title: string } | null }[];
      const enrollments = enrollmentsRes.data;
      const attendance = attendanceRes.data;

      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const activeStudents = new Set(enrollments.map((e) => e.student_id)).size;

      const revenueByDay = new Map<string, number>();
      for (const p of payments) {
        const day = p.created_at.slice(0, 10);
        revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Number(p.amount));
      }
      const revenueTrend = Array.from(revenueByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, revenue]) => ({ date: date.slice(5), revenue }));

      const salesByCourse = new Map<string, number>();
      for (const p of payments) {
        const title = p.courses?.title ?? "Untitled";
        salesByCourse.set(title, (salesByCourse.get(title) ?? 0) + Number(p.amount));
      }
      const courseSales = Array.from(salesByCourse.entries()).map(([title, revenue]) => ({ title, revenue }));

      return {
        totalRevenue,
        totalEnrollments: enrollments.length,
        activeStudents,
        totalAttendanceRecords: attendance.length,
        revenueTrend,
        courseSales,
      };
    },
    enabled: !!profile?.tenant_id,
  });
}

export function useFacultyAnalytics() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["analytics", "faculty", profile?.id],
    queryFn: async () => {
      const [attendanceRes, quizAttemptsRes, submissionsRes] = await Promise.all([
        supabase.from("attendance").select("id, live_session_id, duration_seconds"),
        supabase.from("quiz_attempts").select("id, score, submitted_at"),
        supabase.from("assignment_submissions").select("id, grade, submitted_at"),
      ]);
      const attendance = attendanceRes.data ?? [];
      const quizAttempts = quizAttemptsRes.data ?? [];
      const submissions = submissionsRes.data ?? [];

      const sessionsWithAttendance = new Set(attendance.map((a) => a.live_session_id)).size;
      const avgAttendanceDuration =
        attendance.length > 0 ? Math.round(attendance.reduce((s, a) => s + (a.duration_seconds ?? 0), 0) / attendance.length / 60) : 0;
      const completedQuizzes = quizAttempts.filter((a) => a.submitted_at).length;
      const gradedSubmissions = submissions.filter((s) => s.grade !== null).length;

      return {
        sessionsWithAttendance,
        avgAttendanceMinutes: avgAttendanceDuration,
        totalQuizAttempts: quizAttempts.length,
        completedQuizzes,
        totalSubmissions: submissions.length,
        gradedSubmissions,
      };
    },
    enabled: !!profile?.id,
  });
}
