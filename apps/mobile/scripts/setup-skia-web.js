const fs = require('fs');
const path = require('path');

// Copy canvaskit.wasm to public directory
const wasmPath = require.resolve('canvaskit-wasm/bin/full/canvaskit.wasm');
const publicDir = path.join(__dirname, '..', 'public');
const destPath = path.join(publicDir, 'canvaskit.wasm');

// Create public directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy the file
fs.copyFileSync(wasmPath, destPath);
console.log('✅ Copied canvaskit.wasm to public directory');