import { useRouter } from "@tanstack/react-router";

import { signInWithGoogle } from "../api/authApi";

export const handleSignInWithGoogle = async (
  router: ReturnType<typeof useRouter>,
) => {
  try {
    await signInWithGoogle();
    router.navigate({ to: "/" });
  } catch (error) {
    console.error("Sign-in error:", error);
    // TODO: エラーハンドリングを改善
    alert("サインインに失敗しました");
  }
};
