const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// pnpm sometimes creates _tmp_* directories while hoisting packages; Metro's
// FallbackWatcher crashes when it tries to watch them after they're removed.
// Block the pattern entirely so Metro never registers those paths.
config.resolver = config.resolver ?? {};
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  /node_modules\/\.pnpm\/.*_tmp_[^/]*\/.*/,
];

module.exports = config;
