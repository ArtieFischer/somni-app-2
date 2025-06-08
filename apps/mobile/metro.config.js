// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..'); // Assuming apps/mobile is 2 levels down from monorepo root

const config = getDefaultConfig(projectRoot);

// Monorepo settings:
config.watchFolders = [workspaceRoot]; // Watch the entire monorepo
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'), // App-specific node_modules
  path.resolve(workspaceRoot, 'node_modules'), // Monorepo root node_modules
];

// Optional: if you have issues with symlinks (often needed in monorepos)
// Make sure to install `metro-resolver-symlinks` if you use this
// const { GazeWatcher } = require('jest-haste-map');
// config.watchman = false; // Required if using GazeWatcher for symlinks
// config.fileWatcher = new GazeWatcher();
// config.resolver.unstable_enableSymlinks = true;

module.exports = config;