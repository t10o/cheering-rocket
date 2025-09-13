import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/shared/components/PageHeader";
import { ProfileFormContainer } from "@/features/profile/components/container/ProfileFormContainer";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <PageHeader title="プロフィール" />
      <ProfileFormContainer />
    </div>
  );
}
