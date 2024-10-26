"use server";

import { LoginFormData, LoginFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function login(formData: LoginFormData) {
  console.log("auth");

  const validatedFields = LoginFormSchema.safeParse({
    password: formData.password,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { password } = validatedFields.data;

  if (password !== "123") {
    return {
      errors: { password: ["Incorrect password. Please try again."] },
    };
  }

  return {
    message: "ok",
  };

  // Call the provider or db to create a user...
}
