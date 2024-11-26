import tailwindConfig from "@rocket/tailwind-config/tailwind.config";
import { Config } from "tailwindcss";

const config: Pick<Config, "presets"> = {
  presets: [tailwindConfig],
};

export default config;
