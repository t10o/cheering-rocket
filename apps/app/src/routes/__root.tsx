import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createRootRoute,
  Link,
  Navigate,
  Outlet,
  useCanGoBack,
  useRouter,
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
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const publicPaths = ["/auth/signin"];
  const notGoBackPaths = ["/auth/signin", "/"];

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth/signin" search={{ redirect: location.href }} />;
  }

  if (user && location.pathname === "/auth/signin") {
    return <Navigate to="/" />;
  }

  const handleBackClick = () => {
    if (canGoBack) {
      router.history.back();
    }
  };

  return (
    <>
      <AppBar
        bordered
        left={
          notGoBackPaths.includes(location.pathname) ? undefined : (
            <FontAwesomeIcon icon={faArrowLeft} onClick={handleBackClick} />
          )
        }
        center={<div>Cheering Rocket</div>}
      />

      <Outlet />

      {/* Start rendering router matches */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
