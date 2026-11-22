"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import {
  Eye,
  EyeOff,
  Loader2,
  Film,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    try {
      const normalizedUsername = data.username.trim().toLowerCase();
      const usernameDoc = await getDoc(
        doc(db, "usernames", normalizedUsername),
      );
      if (usernameDoc.exists()) {
        setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.username.trim() });

      const idToken = await user.getIdToken(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username: data.username.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        await deleteUser(user);
        if (response.status === 409) {
          setError("username", {
            type: "manual",
            message: result.error || "Username is already taken",
          });
        } else {
          setServerError(result.error || "Failed to complete registration.");
        }
        return;
      }

      await user.getIdToken(true);

      setIsSuccess(true);
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("email", {
          type: "manual",
          message: "An account with this email already exists.",
        });
      } else if (firebaseError.code === "auth/weak-password") {
        setError("password", {
          type: "manual",
          message: "Password is too weak.",
        });
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-[#292E37] bg-[#1B2027] p-6 sm:p-8">
      {/* Header Brand */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#6F1BA5]/20 border border-[#6F1BA5]/40">
          <Film className="h-6 w-6 text-[#E5C51A]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F7]">
          Create Your Account
        </h1>
        <p className="mt-1 text-sm text-[#858B96]">
          Join <span className="font-semibold text-[#F4F5F7]">STAR Cinema</span>{" "}
          to book tickets & unlock member rewards
        </p>
      </div>

      {/* Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Success Alert */}
      {isSuccess && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Account created! Redirecting to dashboard...</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[#F4F5F7]">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            disabled={isSubmitting || isSuccess}
            className="h-11 border-[#292E37] bg-[#12151B] text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-[#F4F5F7]"
          >
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="cinephile_99"
            autoComplete="username"
            disabled={isSubmitting || isSuccess}
            className="h-11 border-[#292E37] bg-[#12151B] text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs text-red-400">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
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
              placeholder="Min. 8 chars, 1 uppercase & 1 number"
              autoComplete="new-password"
              disabled={isSubmitting || isSuccess}
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-[#F4F5F7]"
          >
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              disabled={isSubmitting || isSuccess}
              className="h-11 border-[#292E37] bg-[#12151B] pr-10 text-[#F4F5F7] placeholder:text-[#858B96] focus-visible:border-[#6F1BA5] focus-visible:ring-[#6F1BA5]"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858B96] hover:text-[#F4F5F7]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="mt-2 h-11 w-full bg-[#6F1BA5] font-semibold text-[#F4F5F7] transition-colors hover:bg-[#8B2FC1] disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-[#292E37] pt-5 text-center text-sm text-[#858B96]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#E5C51A] hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
