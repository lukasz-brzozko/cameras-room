import { z } from "zod";

export const LoginFormSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

export type FormState =
  | {
      errors?: {
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};
