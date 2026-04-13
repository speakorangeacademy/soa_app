import { z } from "zod";

/**
 * Base Schemas
 */

export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .trim();

export const phoneSchema = z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits");

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters");

export const pastDateSchema = z
    .string()
    .min(1, "Date is required")
    .refine((val) => {
        const inputDate = new Date(val);
        const now = new Date();
        // Set both to midnight for accurate comparison
        inputDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        return inputDate <= now;
    }, "Date cannot be in the future");

/**
 * Business Object Schemas
 */

export const signupSchema = z.object({
    full_name: z.string().min(1, "Full name is required").trim(),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const studentDetailsSchema = z.object({
    first_name: z.string().min(1, "First name is required").trim(),
    last_name: z.string().min(1, "Last name is required").trim(),
    email: emailSchema,
    phone: phoneSchema,
    date_of_birth: pastDateSchema,
    address: z.string().min(5, "Address must be at least 5 characters").trim(),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

// Used by the unified login form — accepts email OR any 10-digit mobile number
export const loginIdentifierSchema = z.object({
    identifier: z
        .string()
        .min(1, "Email or mobile number is required")
        .refine((val) => {
            const isEmail = z.string().email().safeParse(val).success;
            const isMobile = /^\d{10}$/.test(val);
            return isEmail || isMobile;
        }, "Enter a valid email address or 10-digit mobile number"),
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const dateRangeSchema = z
    .object({
        start_date: z.string().min(1, "Start date is required"),
        end_date: z.string().min(1, "End date is required"),
    })
    .refine((data) => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return start <= end;
    }, {
        message: "Start date must be before or equal to end date",
        path: ["end_date"],
    });

// Types for inferring schemas
export type StudentDetailsInput = z.infer<typeof studentDetailsSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginIdentifierInput = z.infer<typeof loginIdentifierSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
