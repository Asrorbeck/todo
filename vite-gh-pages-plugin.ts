import type { Plugin } from 'vite';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export function viteGhPages404(): Plugin {
  return {
    name: 'vite-gh-pages-404',
    apply: 'build',
    closeBundle() {
      // After build completes, copy index.html to 404.html
      const distPath = join(process.cwd(), 'dist');
      try {
        const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');
        writeFileSync(join(distPath, '404.html'), indexHtml);
        console.log('✓ Created 404.html for GitHub Pages');
      } catch (error) {
        console.error('Failed to create 404.html:', error);
      }
    }
  };
}

