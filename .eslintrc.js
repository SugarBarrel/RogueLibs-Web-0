/**
 * @type {import('eslint').Linter.Config<import('eslint/rules/index').ESLintRules>}
 */
module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "next/core-web-vitals", // https://github.com/vercel/next.js/tree/canary/packages/eslint-config-next
    // extends:
    //   "next"
    //   // "plugin:react/recommended"
    //   // "plugin:react-hooks/recommended"
    //   // "plugin:@next/next/recommended"
    //   "plugin:@next/next/core-web-vitals"
    // plugins:
    //   "import", "react", "jsx-a11y"
    "plugin:prettier/recommended",
    // extends: "prettier"
    // plugins: "prettier"
  ],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "warn",
    "array-callback-return": "warn", // enforce return on Array.map() and etc.
    "no-constant-binary-expression": "warn", // a + b ?? c
    "no-dupe-class-members": "off", // that's a TypeScript thing
    "no-unused-vars": "off", // reacts to overloads and types for some reason
    "no-redeclare": "off", // I wanna combine namespaces with functions
    "react-hooks/exhaustive-deps": "off", // the amount of extra dependencies is excessive
  },
  globals: {
    React: true,
  },
};
