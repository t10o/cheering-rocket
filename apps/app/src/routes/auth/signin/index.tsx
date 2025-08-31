import { createFileRoute, useRouter } from "@tanstack/react-router";
import clsx from "clsx";

import { GoogleButton } from "@cheering/ui";

import { signInWithGoogle } from "@/libs/firebaseAuth";

export const Route = createFileRoute("/auth/signin/")({
  component: SignIn,
});

function SignIn() {
  const router = useRouter();

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert(error);
    }
    router.navigate({ to: "/" });
  };

  return (
    <div
      className={clsx(
        "flex",
        "flex-col",
        "gap-3",
        "max-w-sm",
        "mx-auto",
        "mt-10",
        "justify-center",
      )}
    >
      <h1 className={clsx("text-2xl", "font-bold")}>サインイン</h1>
      <GoogleButton onPress={handleSignInWithGoogle} />
    </div>
  );
}
