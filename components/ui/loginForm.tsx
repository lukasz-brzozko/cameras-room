"use client";

import { login } from "@/lib/actions/auth";
import { LoginFormData, LoginFormSchema } from "@/lib/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";

export function LoginForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { password: "" },
  });

  const { isSubmitting, isSubmitSuccessful } = form.formState;
  const isLoading = isSubmitting || isSubmitSuccessful;

  const onSubmit = async (formData: LoginFormData) => {
    const result = await login(formData);

    // Możesz obsłużyć wynik, np. przekazać błędy do formularza
    if (result?.errors?.password) {
      // Można tu ustawić błędy w formularzu
      console.log(result.errors);

      form.setError("password", {
        type: "manual",
        message: result.errors.password[0], // Komunikat o błędzie
      });
    }

    if (result?.message === "ok") {
      router.replace("/");
    }
  };

  return (
    <Form {...form}>
      <motion.form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} disabled={isLoading} />
              </FormControl>
              <AnimatePresence>
                <FormMessage />
              </AnimatePresence>
            </FormItem>
          )}
        />
        <motion.div transition={{ duration: 0.1 }} layout>
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
}
