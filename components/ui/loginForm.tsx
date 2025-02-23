"use client";

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
import { login } from "@/lib/actions/auth";
import { LoginFormData, LoginFormSchema } from "@/lib/definitions";

export function LoginForm() {
  const router = useRouter();

  const form = useForm({
    defaultValues: { password: "" },
    resolver: zodResolver(LoginFormSchema),
  });

  const { isSubmitSuccessful, isSubmitting } = form.formState;
  const isLoading = isSubmitting || isSubmitSuccessful;

  const onSubmit = async (formData: LoginFormData) => {
    const result = await login(formData);

    // Możesz obsłużyć wynik, np. przekazać błędy do formularza
    if (result?.errors?.password) {
      // Można tu ustawić błędy w formularzu
      console.log(result.errors);

      form.setError("password", {
        message: result.errors.password[0], // Komunikat o błędzie
        type: "manual",
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
        <motion.div layout transition={{ duration: 0.1 }}>
          <Button disabled={isLoading} type="submit">
            Submit
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
}
