// Hand-written to mirror supabase/migrations/20260718120000_core_schema.sql.
// Regenerate for real once a project is connected:
//   pnpm db:types   (runs `supabase gen types typescript --local`)
// Keep this file's shape until then so the apps typecheck against something real.

import type { Role, TenantStatus, CourseStatus, LessonType, LiveSessionStatus, PaymentGateway, PaymentStatus, QuestionType } from "./enums";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type NotificationChannel = "email" | "push" | "sms";
export type NotificationStatus = "pending" | "sent" | "failed";

interface Table<Row, Insert, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      tenants: Table<
        {
          id: string;
          name: string;
          slug: string;
          custom_domain: string | null;
          branding: Json;
          gstin: string | null;
          subscription_plan: string;
          status: TenantStatus;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          name: string;
          slug: string;
          custom_domain?: string | null;
          branding?: Json;
          gstin?: string | null;
          subscription_plan?: string;
          status?: TenantStatus;
        }
      >;
      profiles: Table<
        {
          id: string;
          tenant_id: string | null;
          role: Role;
          name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id: string;
          tenant_id?: string | null;
          role?: Role;
          name: string;
          phone?: string | null;
          avatar_url?: string | null;
        }
      >;
      courses: Table<
        {
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          price: number;
          currency: string;
          validity_days: number;
          status: CourseStatus;
          created_by: string | null;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          tenant_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          currency?: string;
          validity_days?: number;
          status?: CourseStatus;
          created_by?: string | null;
        }
      >;
      course_faculty: Table<
        { course_id: string; faculty_id: string; tenant_id: string },
        { course_id: string; faculty_id: string; tenant_id: string }
      >;
      modules: Table<
        {
          id: string;
          course_id: string;
          tenant_id: string;
          title: string;
          order_index: number;
          created_at: string;
          deleted_at: string | null;
        },
        { id?: string; course_id: string; tenant_id: string; title: string; order_index?: number }
      >;
      lessons: Table<
        {
          id: string;
          module_id: string;
          tenant_id: string;
          title: string;
          type: LessonType;
          order_index: number;
          content_ref: Json;
          drip_release_at: string | null;
          is_free_preview: boolean;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          module_id: string;
          tenant_id: string;
          title: string;
          type: LessonType;
          order_index?: number;
          content_ref?: Json;
          drip_release_at?: string | null;
          is_free_preview?: boolean;
        }
      >;
      live_sessions: Table<
        {
          id: string;
          lesson_id: string;
          tenant_id: string;
          scheduled_at: string;
          started_at: string | null;
          ended_at: string | null;
          livekit_room_name: string | null;
          recording_url: string | null;
          status: LiveSessionStatus;
          reminder_24h_sent: boolean;
          reminder_15m_sent: boolean;
          created_at: string;
        },
        {
          id?: string;
          lesson_id: string;
          tenant_id: string;
          scheduled_at: string;
          started_at?: string | null;
          ended_at?: string | null;
          livekit_room_name?: string | null;
          recording_url?: string | null;
          status?: LiveSessionStatus;
          reminder_24h_sent?: boolean;
          reminder_15m_sent?: boolean;
        }
      >;
      attendance: Table<
        {
          id: string;
          tenant_id: string;
          live_session_id: string;
          student_id: string;
          joined_at: string;
          left_at: string | null;
          duration_seconds: number;
        },
        {
          id?: string;
          tenant_id: string;
          live_session_id: string;
          student_id: string;
          joined_at?: string;
          left_at?: string | null;
          duration_seconds?: number;
        }
      >;
      batches: Table<
        {
          id: string;
          tenant_id: string;
          course_id: string;
          name: string;
          schedule: Json;
          created_at: string;
          deleted_at: string | null;
        },
        { id?: string; tenant_id: string; course_id: string; name: string; schedule?: Json }
      >;
      batch_students: Table<
        { batch_id: string; student_id: string; tenant_id: string },
        { batch_id: string; student_id: string; tenant_id: string }
      >;
      payments: Table<
        {
          id: string;
          tenant_id: string;
          student_id: string;
          course_id: string | null;
          gateway: PaymentGateway;
          gateway_order_id: string | null;
          gateway_payment_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          gst_invoice_number: string | null;
          gst_breakup: Json | null;
          created_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          student_id: string;
          course_id?: string | null;
          gateway: PaymentGateway;
          gateway_order_id?: string | null;
          gateway_payment_id?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          gst_invoice_number?: string | null;
          gst_breakup?: Json | null;
        }
      >;
      enrollments: Table<
        {
          id: string;
          tenant_id: string;
          student_id: string;
          course_id: string;
          payment_id: string | null;
          purchased_at: string;
          expires_at: string | null;
          progress_percent: number;
          created_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          student_id: string;
          course_id: string;
          payment_id?: string | null;
          purchased_at?: string;
          expires_at?: string | null;
          progress_percent?: number;
        }
      >;
      quizzes: Table<
        {
          id: string;
          tenant_id: string;
          lesson_id: string | null;
          title: string;
          time_limit_minutes: number | null;
          negative_marking: boolean;
          created_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          lesson_id?: string | null;
          title: string;
          time_limit_minutes?: number | null;
          negative_marking?: boolean;
        }
      >;
      questions: Table<
        {
          id: string;
          tenant_id: string;
          quiz_id: string;
          type: QuestionType;
          prompt: string;
          options: Json | null;
          correct_option_index: number | null;
          marks: number;
          negative_marks: number;
          order_index: number;
        },
        {
          id?: string;
          tenant_id: string;
          quiz_id: string;
          type: QuestionType;
          prompt: string;
          options?: Json | null;
          correct_option_index?: number | null;
          marks?: number;
          negative_marks?: number;
          order_index?: number;
        }
      >;
      quiz_attempts: Table<
        {
          id: string;
          tenant_id: string;
          quiz_id: string;
          student_id: string;
          answers: Json;
          score: number | null;
          started_at: string;
          submitted_at: string | null;
        },
        {
          id?: string;
          tenant_id: string;
          quiz_id: string;
          student_id: string;
          answers?: Json;
          score?: number | null;
          started_at?: string;
          submitted_at?: string | null;
        }
      >;
      assignments: Table<
        {
          id: string;
          tenant_id: string;
          lesson_id: string | null;
          title: string;
          instructions: string | null;
          due_at: string | null;
          max_marks: number;
          created_at: string;
        },
        {
          id?: string;
          tenant_id: string;
          lesson_id?: string | null;
          title: string;
          instructions?: string | null;
          due_at?: string | null;
          max_marks?: number;
        }
      >;
      assignment_submissions: Table<
        {
          id: string;
          tenant_id: string;
          assignment_id: string;
          student_id: string;
          file_url: string | null;
          submitted_at: string;
          grade: number | null;
          feedback: string | null;
          graded_at: string | null;
          graded_by: string | null;
        },
        {
          id?: string;
          tenant_id: string;
          assignment_id: string;
          student_id: string;
          file_url?: string | null;
          submitted_at?: string;
          grade?: number | null;
          feedback?: string | null;
          graded_at?: string | null;
          graded_by?: string | null;
        }
      >;
      certificates: Table<
        {
          id: string;
          tenant_id: string;
          student_id: string;
          course_id: string;
          issued_at: string;
          certificate_url: string | null;
        },
        {
          id?: string;
          tenant_id: string;
          student_id: string;
          course_id: string;
          issued_at?: string;
          certificate_url?: string | null;
        }
      >;
      notifications: Table<
        {
          id: string;
          tenant_id: string | null;
          user_id: string;
          type: string;
          channel: NotificationChannel;
          status: NotificationStatus;
          payload: Json;
          sent_at: string | null;
          read_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          tenant_id?: string | null;
          user_id: string;
          type: string;
          channel?: NotificationChannel;
          status?: NotificationStatus;
          payload?: Json;
          sent_at?: string | null;
          read_at?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
