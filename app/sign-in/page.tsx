import { SignInClient } from "@/app/sign-in/SignInClient";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  return <SignInClient returnTo={searchParams.returnTo ?? "/jobs"} />;
}
