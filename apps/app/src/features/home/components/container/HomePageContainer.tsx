import { HomePagePresenter } from "../presenter/HomePagePresenter";
import { getMenuItems } from "../../functions/menuItems";

export const HomePageContainer = () => {
  const menuItems = getMenuItems();

  return <HomePagePresenter menuItems={menuItems} />;
};
