"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { LoadingSpinner } from "./loadingSpinner";
import { login } from "@/lib/actions/auth";
import { LoginFormData, LoginFormSchema } from "@/lib/definitions";

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const STORAGE_KEY = "loginSecurity";

interface LoginSecurity {
  attempts: number;
  blockUntil: number | null;
  lastAttemptTime: number;
}

const defaultSecurity: LoginSecurity = {
  attempts: 0,
  blockUntil: null,
  lastAttemptTime: 0,
};

const getLoginSecurity = (): LoginSecurity => {
  if (typeof window === "undefined") return defaultSecurity;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultSecurity;

  const security: LoginSecurity = JSON.parse(stored);

  // Reset if last attempt was more than 10 minutes ago
  if (Date.now() - security.lastAttemptTime > BLOCK_DURATION) {
    return defaultSecurity;
  }

  return security;
};

const saveLoginSecurity = (security: LoginSecurity) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(security));
};

export function LoginForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [security, setSecurity] = useState<LoginSecurity>(defaultSecurity);

  const form = useForm({
    defaultValues: { password: "" },
    resolver: zodResolver(LoginFormSchema),
  });

  const { isSubmitSuccessful, isSubmitting } = form.formState;
  const isLoading = isSubmitting || isSubmitSuccessful;
  const isBlocked =
    mounted && security.blockUntil && Date.now() < security.blockUntil;

  // Initialize security state after mount
  useEffect(() => {
    setSecurity(getLoginSecurity());
    setMounted(true);
  }, []);

  // Check if the block duration has expired
  useEffect(() => {
    if (!mounted) return;

    const checkBlockStatus = () => {
      const currentSecurity = getLoginSecurity();
      if (
        currentSecurity.blockUntil &&
        Date.now() >= currentSecurity.blockUntil
      ) {
        setSecurity(defaultSecurity);
        saveLoginSecurity(defaultSecurity);
      }
    };

    checkBlockStatus();
    const interval = setInterval(checkBlockStatus, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const onSubmit = async (formData: LoginFormData) => {
    if (!mounted) return;

    // Prevent submission if blocked
    if (isBlocked) {
      const minutesLeft = Math.ceil(
        (security.blockUntil! - Date.now()) / 60000,
      );
      form.setError("password", {
        message: `Too many failed attempts. Please try again in ${minutesLeft} minutes.`,
        type: "manual",
      });
      return;
    }

    const result = await login(formData);

    if (result?.errors?.password) {
      const newAttempts = security.attempts + 1;
      const newSecurity: LoginSecurity = {
        attempts: newAttempts,
        blockUntil:
          newAttempts >= MAX_LOGIN_ATTEMPTS
            ? Date.now() + BLOCK_DURATION
            : null,
        lastAttemptTime: Date.now(),
      };

      setSecurity(newSecurity);
      saveLoginSecurity(newSecurity);

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        form.setError("password", {
          message: "Too many failed attempts. Please try again in 10 minutes.",
          type: "manual",
        });
      } else {
        form.setError("password", {
          message: `${result.errors.password[0]} (${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining)`,
          type: "manual",
        });
      }
    }

    if (result?.message === "ok") {
      setSecurity(defaultSecurity);
      saveLoginSecurity(defaultSecurity);
      router.replace("/");
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      {mounted && (
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
                          disabled={!!(isLoading || isBlocked)}
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
                    disabled={!!(isLoading || isBlocked)}
                    type="submit"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <LoadingSpinner className="h-4 w-4" />
                        Authenticating...
                      </div>
                    ) : isBlocked ? (
                      "Temporarily Blocked"
                    ) : (
                      "Login"
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </Form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
