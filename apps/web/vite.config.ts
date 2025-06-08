import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // You might need to install @types/node for this app
                       // npm install @types/node --save-dev --workspace=@somni/web (from root)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This ensures imports like '@somni/types' work correctly
      '@somni/types': path.resolve(__dirname, '../../types/src'),
      '@somni/utils': path.resolve(__dirname, '../../utils/src'),
      // Add other aliases if you create more shared packages
      // e.g. '@somni/ui-core': path.resolve(__dirname, '../../packages/ui-core/src'),
    },
  },
  // Optional: If you encounter issues with Vite's dev server not picking up
  // changes in your shared packages, you might need to configure server.watch.
  // server: {
  //   watch: {
  //     ignored: [
  //       // Ignore all node_modules folders to prevent excessive watching,
  //       // BUT ensure symlinked workspace packages are NOT ignored if they are inside node_modules
  //       // This can be tricky. Often, explicitly watching the workspace root is better (see below).
  //       "!**/node_modules/@somni/**"
  //     ],
  //     // Or, more directly, tell Vite to watch outside its root
  //     // usePolling: true, // As a last resort if file system events aren't working
  //   },
  //   // If your shared packages are outside apps/web, Vite might not watch them.
  //   // Force watching the monorepo root's relevant shared package folders.
  //   // This is usually handled by tools like Turborepo or Nx, but for plain npm:
  //   fs: {
  //     allow: [
  //       '../..', // Allow serving files from one level up (monorepo root)
  //     ],
  //   },
  // },
})