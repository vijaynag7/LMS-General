export const ROLES = [
  "super_admin",
  "institute_admin",
  "faculty",
  "student",
  "parent",
  "support",
] as const;
export type Role = (typeof ROLES)[number];

export const LESSON_TYPES = ["live", "recorded", "quiz", "assignment", "document"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export const COURSE_STATUSES = ["draft", "published", "archived"] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const LIVE_SESSION_STATUSES = [
  "scheduled",
  "live",
  "ended",
  "cancelled",
] as const;
export type LiveSessionStatus = (typeof LIVE_SESSION_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "created",
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_GATEWAYS = ["razorpay", "stripe"] as const;
export type PaymentGateway = (typeof PAYMENT_GATEWAYS)[number];

export const TENANT_STATUSES = ["trial", "active", "suspended", "cancelled"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const QUESTION_TYPES = ["mcq", "true_false", "short_answer", "file_upload"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
