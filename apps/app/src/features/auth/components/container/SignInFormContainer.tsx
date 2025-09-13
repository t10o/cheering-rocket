import { useRouter } from "@tanstack/react-router";
import { SignInFormPresenter } from "../presenter/SignInFormPresenter";
import { handleSignInWithGoogle } from "../../functions/signIn";

export const SignInFormContainer = () => {
  const router = useRouter();

  const onSignInWithGoogle = () => {
    handleSignInWithGoogle(router);
  };

  return <SignInFormPresenter onSignInWithGoogle={onSignInWithGoogle} />;
};
