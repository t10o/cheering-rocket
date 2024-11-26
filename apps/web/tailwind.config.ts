import tailwindConfig from "@rocket/tailwind-config/tailwind.config";
import { Config } from "tailwindcss";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  presets: [tailwindConfig],
};

export default config;
