"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
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

    if (result?.errors?.password) {
      form.setError("password", {
        message: result.errors.password[0],
        type: "manual",
      });
    }

    if (result?.message === "ok") {
      router.replace("/");
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <Card className="w-[95%] max-w-[380px] sm:w-[380px] dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="flex items-center justify-center gap-2 text-center text-xl sm:text-2xl dark:text-zinc-200">
            <LockKeyhole className="h-5 w-5 sm:h-6 sm:w-6" />
            Authentication
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base dark:text-zinc-400">
            Enter your password to access the application
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <motion.form
              className="space-y-3 sm:space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base dark:text-zinc-200">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                        className="h-9 text-sm sm:h-10 sm:text-base dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <AnimatePresence>
                      <FormMessage className="text-xs sm:text-sm" />
                    </AnimatePresence>
                  </FormItem>
                )}
              />
              <motion.div
                layout
                className="pt-1 sm:pt-2"
                transition={{ duration: 0.1 }}
              >
                <Button
                  className="h-9 w-full text-sm sm:h-10 sm:text-base dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-300"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Authenticating..." : "Login"}
                </Button>
              </motion.div>
            </motion.form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
