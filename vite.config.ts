import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { viteGhPages404 } from "./vite-gh-pages-plugin"

export default defineConfig({
  plugins: [react(), viteGhPages404()],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
