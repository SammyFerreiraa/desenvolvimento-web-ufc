/** @type {import("prettier").Config} */

module.exports = {
   plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
   importOrder: ["^react", "<THIRD_PARTY_MODULES>", "^@", "^[./]"],
   importOrderSeparation: true,
   importOrderSortSpecifiers: true,
   singleQuote: false,
   proseWrap: "always",
   tabWidth: 3,
   useTabs: false,
   printWidth: 120,
   trailingComma: "none",
   bracketSpacing: true,
   jsxBracketSameLine: false,
   semi: true,
   endOfLine: "lf"
};
