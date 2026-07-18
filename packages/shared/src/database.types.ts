export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          file_url: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          student_id: string
          submitted_at: string
          tenant_id: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          student_id: string
          submitted_at?: string
          tenant_id: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          student_id?: string
          submitted_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string
          due_at: string | null
          id: string
          instructions: string | null
          lesson_id: string | null
          max_marks: number
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          max_marks?: number
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          max_marks?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          duration_seconds: number
          id: string
          joined_at: string
          left_at: string | null
          live_session_id: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          duration_seconds?: number
          id?: string
          joined_at?: string
          left_at?: string | null
          live_session_id: string
          student_id: string
          tenant_id: string
        }
        Update: {
          duration_seconds?: number
          id?: string
          joined_at?: string
          left_at?: string | null
          live_session_id?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_live_session_id_fkey"
            columns: ["live_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_students: {
        Row: {
          batch_id: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          batch_id: string
          student_id: string
          tenant_id: string
        }
        Update: {
          batch_id?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          schedule: Json
          tenant_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          schedule?: Json
          tenant_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          schedule?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string
          student_id: string
          tenant_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      course_faculty: {
        Row: {
          course_id: string
          faculty_id: string
          tenant_id: string
        }
        Insert: {
          course_id: string
          faculty_id: string
          tenant_id: string
        }
        Update: {
          course_id?: string
          faculty_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_faculty_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_faculty_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_faculty_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          description: string | null
          duration_label: string | null
          id: string
          price: number
          status: Database["public"]["Enums"]["course_status"]
          tenant_id: string
          thumbnail_url: string | null
          title: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          duration_label?: string | null
          id?: string
          price?: number
          status?: Database["public"]["Enums"]["course_status"]
          tenant_id: string
          thumbnail_url?: string | null
          title: string
          validity_days?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          description?: string | null
          duration_label?: string | null
          id?: string
          price?: number
          status?: Database["public"]["Enums"]["course_status"]
          tenant_id?: string
          thumbnail_url?: string | null
          title?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          expires_at: string | null
          id: string
          payment_id: string | null
          progress_percent: number
          purchased_at: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          progress_percent?: number
          purchased_at?: string
          student_id: string
          tenant_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          progress_percent?: number
          purchased_at?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_ref: Json
          created_at: string
          deleted_at: string | null
          drip_release_at: string | null
          id: string
          is_free_preview: boolean
          module_id: string
          order_index: number
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
        }
        Insert: {
          content_ref?: Json
          created_at?: string
          deleted_at?: string | null
          drip_release_at?: string | null
          id?: string
          is_free_preview?: boolean
          module_id: string
          order_index?: number
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["lesson_type"]
        }
        Update: {
          content_ref?: Json
          created_at?: string
          deleted_at?: string | null
          drip_release_at?: string | null
          id?: string
          is_free_preview?: boolean
          module_id?: string
          order_index?: number
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["lesson_type"]
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          lesson_id: string
          livekit_room_name: string | null
          recording_url: string | null
          reminder_15m_sent: boolean
          reminder_24h_sent: boolean
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["live_session_status"]
          tenant_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lesson_id: string
          livekit_room_name?: string | null
          recording_url?: string | null
          reminder_15m_sent?: boolean
          reminder_24h_sent?: boolean
          scheduled_at: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["live_session_status"]
          tenant_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          lesson_id?: string
          livekit_room_name?: string | null
          recording_url?: string | null
          reminder_15m_sent?: boolean
          reminder_24h_sent?: boolean
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["live_session_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_sessions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          id: string
          order_index: number
          tenant_id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_index?: number
          tenant_id: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          order_index?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          tenant_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          tenant_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          tenant_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          currency: string
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gst_breakup: Json | null
          gst_invoice_number: string | null
          id: string
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          currency?: string
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gst_breakup?: Json | null
          gst_invoice_number?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          tenant_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string
          gateway?: Database["public"]["Enums"]["payment_gateway"]
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gst_breakup?: Json | null
          gst_invoice_number?: string | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["role"]
          tenant_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role"]
          tenant_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["role"]
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_option_index: number | null
          id: string
          marks: number
          negative_marks: number
          options: Json | null
          order_index: number
          prompt: string
          quiz_id: string
          tenant_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          correct_option_index?: number | null
          id?: string
          marks?: number
          negative_marks?: number
          options?: Json | null
          order_index?: number
          prompt: string
          quiz_id: string
          tenant_id: string
          type: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          correct_option_index?: number | null
          id?: string
          marks?: number
          negative_marks?: number
          options?: Json | null
          order_index?: number
          prompt?: string
          quiz_id?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          id: string
          quiz_id: string
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
          tenant_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          quiz_id: string
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
          tenant_id: string
        }
        Update: {
          answers?: Json
          id?: string
          quiz_id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          negative_marking: boolean
          tenant_id: string
          time_limit_minutes: number | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          negative_marking?: boolean
          tenant_id: string
          time_limit_minutes?: number | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          negative_marking?: boolean
          tenant_id?: string
          time_limit_minutes?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          branding: Json
          created_at: string
          custom_domain: string | null
          deleted_at: string | null
          gstin: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          subscription_plan: string
        }
        Insert: {
          branding?: Json
          created_at?: string
          custom_domain?: string | null
          deleted_at?: string | null
          gstin?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          subscription_plan?: string
        }
        Update: {
          branding?: Json
          created_at?: string
          custom_domain?: string | null
          deleted_at?: string | null
          gstin?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          subscription_plan?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["role"]
      }
      current_tenant_id: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      is_tenant_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      course_status: "draft" | "published" | "archived"
      lesson_type: "live" | "recorded" | "quiz" | "assignment" | "document"
      live_session_status: "scheduled" | "live" | "ended" | "cancelled"
      notification_channel: "email" | "push" | "sms"
      notification_status: "pending" | "sent" | "failed"
      payment_gateway: "razorpay" | "stripe"
      payment_status: "created" | "pending" | "paid" | "failed" | "refunded"
      question_type: "mcq" | "true_false" | "short_answer" | "file_upload"
      role:
        | "super_admin"
        | "institute_admin"
        | "faculty"
        | "student"
        | "parent"
        | "support"
      tenant_status: "trial" | "active" | "suspended" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      course_status: ["draft", "published", "archived"],
      lesson_type: ["live", "recorded", "quiz", "assignment", "document"],
      live_session_status: ["scheduled", "live", "ended", "cancelled"],
      notification_channel: ["email", "push", "sms"],
      notification_status: ["pending", "sent", "failed"],
      payment_gateway: ["razorpay", "stripe"],
      payment_status: ["created", "pending", "paid", "failed", "refunded"],
      question_type: ["mcq", "true_false", "short_answer", "file_upload"],
      role: [
        "super_admin",
        "institute_admin",
        "faculty",
        "student",
        "parent",
        "support",
      ],
      tenant_status: ["trial", "active", "suspended", "cancelled"],
    },
  },
} as const
