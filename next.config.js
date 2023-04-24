const path = require("path");
const loaderUtils = require("loader-utils");

// based on https://github.com/vercel/next.js/blob/992c46e63bef20d7ab7e40131667ed3debaf67de/packages/next/build/webpack/config/blocks/css/loaders/getCssModuleLocalIdent.ts
const hashOnlyIdent = (context, _, exportName) => {
  const relativePath = path.relative(context.rootContext, context.resourcePath).replace(/\\+/g, "/");
  const buffer = Buffer.from(`filePath:${relativePath}#className:${exportName}`);

  return loaderUtils
    .getHashDigest(buffer, "md4", "base64", 6)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/^(\d|--|-\d)/, "__$1");
};

// https://stackoverflow.com/a/69166434/16397889
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { dev }) => {
    const rules = config.module.rules
      .find(rule => typeof rule.oneOf === "object")
      .oneOf.filter(rule => Array.isArray(rule.use));

    rules.forEach(rule => {
      rule.use.forEach(moduleLoader => {
        if (moduleLoader.loader?.includes("css-loader") && !moduleLoader.loader?.includes("postcss-loader")) {
          if (!dev) moduleLoader.options.modules.getLocalIdent = hashOnlyIdent;
          moduleLoader.options.modules.exportLocalsConvention = "camelCaseOnly";
        }
      });
    });

    return config;
  },
};

module.exports = nextConfig;
