import tseslint from "typescript-eslint";
import config from "@rocket/eslint-config/react.js";

export default tseslint.config({
  extends: [config],
});
