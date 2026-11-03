import type { Metadata } from "next";
import AuthPage from "../auth-page";

export const metadata: Metadata = {
  title: "লগইন | Karigor",
  description: "ফোন নম্বর ও OTP দিয়ে আপনার Karigor অ্যাকাউন্টে লগইন করুন।",
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
