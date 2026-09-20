module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
            "@components": "./components",
            "@utils": "./utils",
            "@store": "./store",
            "@context": "./context",
            "@types": "./types",
            "@constants": "./constants",
          },
        },
      ],
    ],
  };
};