import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().toLowerCase().email(),
  instituteName: z.string().trim().optional(),
  message: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;
