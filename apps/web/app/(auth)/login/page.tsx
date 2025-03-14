"use client";
import { use } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { AuthSearchParams } from "@/lib/types/auth";
import { handleSignInAndRedirect } from "@/actions/auth";

type Props = {
  searchParams: Promise<AuthSearchParams>;
};

export default function SignIn({ searchParams }: Props) {
  return <AuthForm />;
}
