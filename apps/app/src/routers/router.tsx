import { Route, Routes } from "react-router";

import { Layout } from "../components/Layout/Layout.tsx";
import { HomePage } from "../features/Home/HomePage.tsx";

export const Router = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
    </Route>
  </Routes>
);
