"use server";

import { LoginFormData, LoginFormSchema } from "@/lib/definitions";
import { createSession } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function login(formData: LoginFormData) {
  const validatedFields = LoginFormSchema.safeParse({
    password: formData.password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  if (password !== process.env.PASSWORD) {
    return {
      errors: { password: ["Incorrect password. Please try again."] },
    };
  }

  await createSession(uuidv4());

  return {
    message: "ok",
  };
}
