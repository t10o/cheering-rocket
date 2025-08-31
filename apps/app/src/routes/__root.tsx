import {
  createRootRoute,
  Link,
  Navigate,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppBar } from "@cheering/ui";

import { useAuth } from "@/hooks/useAuth";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>Not Found</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
});

function RootComponent() {
  const { user, loading } = useAuth();
  const { location } = useRouterState();

  const publicPaths = ["/auth/signin"];

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth/signin" search={{ redirect: location.href }} />;
  }

  if (user && location.pathname === "/auth/signin") {
    return <Navigate to="/" />;
  }

  return (
    <>
      <AppBar bordered center={<div>Cheering Rocket</div>} />

      <Outlet />

      {/* Start rendering router matches */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
