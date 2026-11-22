import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | STAR Cinema",
  description: "Sign in to your STAR Cinema account.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#12151B] px-4 py-12">
      <LoginForm />
    </main>
  );
}
