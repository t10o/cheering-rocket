import { createFileRoute } from "@tanstack/react-router";

import { GoogleButton } from "@cheering/ui";

import { signInWithGoogle } from "@/libs/firebaseAuth";

export const Route = createFileRoute("/auth/signin/")({
  component: SignIn,
});

function SignIn() {
  return (
    <div className="flex flex-col gap-3">
      <GoogleButton onPress={() => signInWithGoogle()} />
    </div>
  );
}
