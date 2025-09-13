import { useCanGoBack, useRouter } from "@tanstack/react-router";
import { Button } from "@cheering/ui";

export const BackButton = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const handleBackClick = () => {
    if (canGoBack) {
      router.history.back();
    }
  };

  if (!canGoBack) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={handleBackClick}
      aria-label="戻る"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </Button>
  );
};
