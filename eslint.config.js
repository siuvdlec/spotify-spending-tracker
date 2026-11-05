import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["build/"] },
  js.configs.recommended,
  {
    ...react.configs.flat.recommended,
    files: ["src/**/*.{js,jsx}"],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ["src/**/*.{js,jsx}"],
  },
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/prop-types": "off",
    },
  },
];
