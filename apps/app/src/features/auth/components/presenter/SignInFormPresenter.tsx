import { Button } from "@cheering/ui";

export type SignInFormPresenterProps = {
  onSignInWithGoogle: () => void;
};

export const SignInFormPresenter = ({
  onSignInWithGoogle,
}: SignInFormPresenterProps) => {
  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto mt-10 justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Cheering Rocket
        </h1>
        <p className="text-gray-600">マラソンランナーを応援するアプリ</p>
      </div>

      <div className="space-y-4">
        <Button onPress={onSignInWithGoogle} size="lg" className="w-full">
          Googleでサインイン
        </Button>

        <p className="text-xs text-gray-500 text-center">
          サインインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
        </p>
      </div>
    </div>
  );
};
