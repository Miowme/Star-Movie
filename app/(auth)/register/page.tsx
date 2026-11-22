import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register | STAR Cinema",
  description: "Create a new STAR Cinema account to book movie tickets.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#12151B] px-4 py-12">
      <RegisterForm />
    </main>
  );
}
