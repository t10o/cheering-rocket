import { createFileRoute } from "@tanstack/react-router";

import { SignInFormContainer } from "@/features/auth/components/container/SignInFormContainer";

export const Route = createFileRoute("/auth/signin/")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <SignInFormContainer />
    </div>
  );
}
