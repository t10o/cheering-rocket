import { getMenuItems } from "../../functions/menuItems";
import { HomePagePresenter } from "../presenter/HomePagePresenter";

export const HomePageContainer = () => {
  const menuItems = getMenuItems();

  return <HomePagePresenter menuItems={menuItems} />;
};
