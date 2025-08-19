const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Compiling TypeScript files...');

try {
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Compile TypeScript files for renderer process
  console.log('Compiling renderer TypeScript files...');
  execSync('npx tsc', { stdio: 'inherit' });
  
  // Build React UI with Webpack
  console.log('Building React UI with Webpack...');
  execSync('npx webpack --config webpack.renderer.config.js', { stdio: 'inherit' });
  
  // Compile TypeScript files for main process after Webpack
  console.log('Compiling main process TypeScript...');
  execSync('npx tsc -p electron', { stdio: 'inherit' });
  
  // Compile preload script with TypeScript
  console.log('Compiling preload script...');
  execSync('npx tsc src/js/preload.ts --outDir dist/js --target ES2020 --module commonjs --skipLibCheck', { stdio: 'inherit' });
  
  // Copy index.html to dist folder
  console.log('Copying index.html...');
  fs.copyFileSync('src/index.html', 'dist/index.html');
  
  // Copy CSS file to dist folder
  console.log('Copying CSS files...');
  if (!fs.existsSync('dist/styles')) {
    fs.mkdirSync('dist/styles', { recursive: true });
  }
  fs.copyFileSync('src/styles/ui.css', 'dist/styles/ui.css');
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
