import { PasswordRecovery } from "@/components/PasswordRecovery";

export const metadata = { title: "Set or Reset Password", robots: { index: false, follow: false } };

export default function ResetPasswordPage({ searchParams }: { searchParams: { returnTo?: string } }) {
  return <PasswordRecovery returnTo={searchParams.returnTo || "/jobs"} />;
}
