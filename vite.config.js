import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { defineConfig } from 'vite';

// Get all HTML files from src directory
function getHtmlFiles() {
  const input = {};
  
  // Get root HTML files
  if (existsSync('src')) {
    const htmlFiles = readdirSync('src').filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
      const name = file.split('.')[0];
      input[name] = resolve(__dirname, 'src', file);
    });
  }
  
  // Get module HTML files
  if (existsSync('src/modules')) {
    const moduleFiles = readdirSync('src/modules').filter(file => file.endsWith('.html'));
    moduleFiles.forEach(file => {
      const name = `modules/${file.split('.')[0]}`;
      input[name] = resolve(__dirname, 'src/modules', file);
    });
  }
  
  return input;
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: getHtmlFiles(),
    },
    // Ensure assets are properly handled
    assetsDir: 'assets',
  },
  // Define environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  // Configure dev server
  server: {
    port: 3000,
    open: true,
  },
});