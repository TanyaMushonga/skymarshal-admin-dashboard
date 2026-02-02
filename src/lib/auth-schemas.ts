import { z } from "zod";

/**
 * Login Form Schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid official email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Registration Form Schema
 */
export const registerSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid official email address"),
  force_number: z.string().min(1, "Force number is required"),
  unit_id: z.string().min(1, "Unit ID is required"),
  phone_number: z.string().min(10, "Valid phone number is required"),
  is_certified_pilot: z.boolean(),
  pilot_license_number: z.string().optional(),
  is_2fa_enabled: z.boolean(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Code of Conduct",
  }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
