import { z } from "zod";
import { LESSON_TYPES, COURSE_STATUSES, QUESTION_TYPES } from "./enums";

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const tenantOnboardingSchema = z.object({
  instituteName: z.string().trim().min(2, "Institute name is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only")
    .min(3)
    .max(40),
  category: z.enum(["k12", "competitive_exam", "skill", "professional"]),
});
export type TenantOnboardingInput = z.infer<typeof tenantOnboardingSchema>;

export const onboardInstituteSchema = tenantOnboardingSchema.extend({
  adminName: z.string().trim().min(2, "Your name is required"),
  adminEmail: emailSchema,
  adminPassword: passwordSchema,
});
export type OnboardInstituteInput = z.infer<typeof onboardInstituteSchema>;

export const tenantBrandingSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #6D28D9")
    .optional(),
  gstin: z.string().trim().optional(),
});
export type TenantBrandingInput = z.infer<typeof tenantBrandingSchema>;

// Numeric fields are plain z.number() (not z.coerce.number()) so the schema's
// input and output types match — pair with `valueAsNumber: true` on the
// corresponding react-hook-form `register()` call to convert from the input's
// string value. Using coerce here made @hookform/resolvers infer mismatched
// input/output types against useForm<T>.
export const courseSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  description: z.string().trim().max(5000).optional(),
  price: z.number().min(0),
  currency: z.enum(["INR", "USD"]),
  validityDays: z.number().int().min(0),
  status: z.enum(COURSE_STATUSES),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const moduleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  order: z.number().int().min(0),
});
export type ModuleInput = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  type: z.enum(LESSON_TYPES),
  order: z.number().int().min(0),
  dripReleaseAt: z.string().datetime().optional().nullable(),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const liveSessionSchema = z.object({
  scheduledAt: z.string().datetime(),
});
export type LiveSessionInput = z.infer<typeof liveSessionSchema>;

export const questionSchema = z.object({
  type: z.enum(QUESTION_TYPES),
  prompt: z.string().trim().min(1, "Question text is required"),
  options: z.array(z.string().trim().min(1)).optional(),
  correctOptionIndex: z.number().int().min(0).optional(),
  marks: z.number().min(0),
  negativeMarks: z.number().min(0),
});
export type QuestionInput = z.infer<typeof questionSchema>;

export const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  instructions: z.string().trim().max(5000).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  maxMarks: z.number().min(0),
});
export type AssignmentInput = z.infer<typeof assignmentSchema>;
