import { auth } from "@/auth";
import AdminOnboardingForm from "@/components/onboarding/form";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await auth();
  const isOnboarded = session?.user?.isOnboarded;

  if (isOnboarded) {
    redirect("/dashboard");
  }
  return <AdminOnboardingForm />;
}
