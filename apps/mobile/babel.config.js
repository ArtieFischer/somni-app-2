module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Optional: if you have issues with Metro resolving shared packages
    // plugins: [
    //   [
    //     'module-resolver',
    //     {
    //       root: ['./'], // Keep this if you have local aliases
    //       resolvePath(sourcePath, currentFile, opts) {
    //         // This is a naive example, actual symlink resolution might be more complex
    //         // or handled by Metro's experimental symlink support
    //         if (sourcePath.startsWith('@somni/')) {
    //           // Attempt to point to the actual location of the shared package
    //           // This part needs careful adjustment based on your specific setup
    //           // and how NPM workspaces/Metro handle symlinks
    //           return require.resolve(sourcePath, { paths: [currentFile, '../../'] });
    //         }
    //         return undefined;
    //       },
    //     },
    //   ],
    // ],
  };
};