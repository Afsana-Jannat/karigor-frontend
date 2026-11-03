import type { Metadata } from "next";
import AuthPage from "../auth-page";

export const metadata: Metadata = {
  title: "নিবন্ধন | Karigor",
  description: "Karigor-এ গ্রাহক বা কারিগর হিসেবে নতুন অ্যাকাউন্ট তৈরি করুন।",
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
