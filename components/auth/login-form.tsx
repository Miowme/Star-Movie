"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2, Film, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const idToken = await userCredential.user.getIdToken();

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to establish server session");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        setServerError("Invalid email or password. Please try again.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setServerError(
          "Too many failed login attempts. Please try again later.",
        );
      } else {
        setServerError("Unable to sign in. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-[#292E37] bg-[#1B2027] p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#6F1BA5]/20 border border-[#6F1BA5]/40">
          <Film className="h-6 w-6 text-[#E5C51A]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F7]">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-[#858B96]">
          Sign in to your{" "}
          <span className="font-semibold text-[#F4F5F7]">STAR Cinema</span>{" "}
          account
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#F4F5F7]">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isSubmitting}
            className="h-11 border-[#292E37] bg-[#12151B] text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-[#F4F5F7]"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting}
              className="h-11 border-[#292E37] bg-[#12151B] pr-10 text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858B96] hover:text-[#F4F5F7]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full bg-[#6F1BA5] font-semibold text-[#F4F5F7] transition-colors hover:bg-[#8B2FC1] disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-[#292E37] pt-5 text-center text-sm text-[#858B96]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[#E5C51A] hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
