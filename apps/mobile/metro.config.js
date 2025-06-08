// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Monorepo settings
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 2. Add the aliasing for react-native-web
// This is the crucial addition that solves the web bundling issue.
config.resolver.extraNodeModules = {
  'react-native': path.resolve(__dirname, 'node_modules/react-native-web'),
};

// 3. (Optional but recommended) Add 'mjs' for web compatibility
config.resolver.sourceExts.push('mjs', 'cjs');


module.exports = config;