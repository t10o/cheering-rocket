import { createFileRoute } from "@tanstack/react-router";

import { SignInFormContainer } from "@/features/auth/components/container/SignInFormContainer";

export const Route = createFileRoute("/auth/signin/")({
  component: SignIn,
});

function SignIn() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-marathon-50 to-finish-50 flex items-center justify-center p-4">
      <SignInFormContainer />
    </div>
  );
}
