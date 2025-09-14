import { useRouter } from "@tanstack/react-router";

import { handleSignInWithGoogle } from "../../functions/signIn";
import { SignInFormPresenter } from "../presenter/SignInFormPresenter";

export const SignInFormContainer = () => {
  const router = useRouter();

  const onSignInWithGoogle = () => {
    handleSignInWithGoogle(router);
  };

  return <SignInFormPresenter onSignInWithGoogle={onSignInWithGoogle} />;
};
