import { createFileRoute } from "@tanstack/react-router";
import { HomePageContainer } from "@/features/home/components/container/HomePageContainer";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return <HomePageContainer />;
}
