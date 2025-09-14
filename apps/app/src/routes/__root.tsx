import {
  faHome,
  faPersonRunning,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  createRootRoute,
  Link,
  Navigate,
  Outlet,
  useLocation,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { TabBar, Skeleton } from "@cheering/ui";

import { useAuth } from "@/features/auth/hooks/useAuth";

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

  const publicPaths = ["/auth/signin"];

  if (loading)
    return (
      <div className="min-h-dvh bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton
            width="120px"
            height="120px"
            rounded="full"
            className="mx-auto"
          />
          <div className="space-y-2">
            <Skeleton width="200px" height="24px" className="mx-auto" />
            <Skeleton width="150px" height="16px" className="mx-auto" />
          </div>
        </div>
      </div>
    );

  if (!user && !publicPaths.includes(location.pathname)) {
    return <Navigate to="/auth/signin" search={{ redirect: location.href }} />;
  }

  if (user && location.pathname === "/auth/signin") {
    return <Navigate to="/" />;
  }

  // タブバーのアイテム定義
  const tabItems = [
    {
      to: "/",
      label: "ホーム",
      icon: <FontAwesomeIcon icon={faHome} />,
      exact: true,
      isActive: location.pathname === "/",
      onClick: () => router.navigate({ to: "/" }),
    },
    {
      to: "/events",
      label: "イベント",
      icon: <FontAwesomeIcon icon={faUsers} />,
      exact: false,
      isActive: location.pathname.startsWith("/events"),
      onClick: () => router.navigate({ to: "/events" }),
    },
    {
      to: "/runs",
      label: "ラン",
      icon: <FontAwesomeIcon icon={faPersonRunning} />,
      exact: false,
      isActive: location.pathname.startsWith("/runs"),
      onClick: () => router.navigate({ to: "/runs" }),
    },
    {
      to: "/profile",
      label: "プロフィール",
      icon: <FontAwesomeIcon icon={faUser} />,
      exact: false,
      isActive: location.pathname.startsWith("/profile"),
      onClick: () => router.navigate({ to: "/profile" }),
    },
  ];

  return (
    <>
      <div className="pb-16">
        <Outlet />
      </div>

      {/* タブバー - 認証済みユーザーのみ表示 */}
      {user && <TabBar items={tabItems} />}

      {/* Start rendering router matches */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
