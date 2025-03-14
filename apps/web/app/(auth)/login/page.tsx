"use client";
import { use } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { AuthSearchParams } from "@/lib/types/auth";
import { handleSignInAndRedirect } from "@/actions/auth";

type Props = {
  searchParams: Promise<AuthSearchParams>;
};

export default function SignIn({ searchParams }: Props) {
  const resolvedSearchParams = use(searchParams);

  return (
    <AuthForm
      mode="login"
      title="Welcome Back"
      description="Sign in to your account"
      handleEmailAuth={handleSignInAndRedirect}
      handleGoogleAuth={handleSignInAndRedirect}
      searchParams={resolvedSearchParams}
      alternateAuthLink={{
        text: "Don't have an account? Sign up",
        href: "/signup",
      }}
    />
  );
}
