"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LockKeyhole } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

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
    <Card className="w-[95%] max-w-[380px] mx-auto sm:w-[380px] dark:bg-zinc-950 dark:border-zinc-800">
      <CardHeader className="space-y-1 p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl text-center flex items-center justify-center gap-2 dark:text-zinc-200">
          <LockKeyhole className="w-5 h-5 sm:w-6 sm:h-6" />
          Authentication
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base dark:text-zinc-400">
          Enter your password to access the application
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <Form {...form}>
          <motion.form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base dark:text-zinc-200">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password"
                      {...field} 
                      disabled={isLoading}
                      className="text-sm sm:text-base h-9 sm:h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500" 
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
              transition={{ duration: 0.1 }}
              className="pt-1 sm:pt-2"
            >
              <Button 
                disabled={isLoading} 
                type="submit"
                className="w-full h-9 sm:h-10 text-sm sm:text-base dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:bg-zinc-300"
              >
                {isLoading ? "Authenticating..." : "Login"}
              </Button>
            </motion.div>
          </motion.form>
        </Form>
      </CardContent>
    </Card>
  );
}
