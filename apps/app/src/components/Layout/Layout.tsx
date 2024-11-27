import clsx from "clsx";
import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <main className={clsx("p-4")}>
      <Outlet />
    </main>
  );
};
