import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid SOC operator email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid organizational email address'),
    badgeId: z.string().min(4, 'SOC Operator Badge ID is required (e.g. SOC-8902)'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the SOC compliance terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter your registered SOC operator email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const settingsSchema = z.object({
  alertSensitivity: z.number().min(0.1).max(1.0),
  autoBlockSubnets: z.boolean(),
  siemEndpoint: z.string().url('Must be a valid HTTPS SIEM endpoint URL').or(z.literal('')),
  apiKey: z.string().min(10, 'API Key must be at least 10 characters'),
  slackWebhook: z.string().url('Must be a valid Slack webhook URL').or(z.literal('')),
  emailNotifications: z.boolean(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
