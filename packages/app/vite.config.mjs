import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

import 'dotenv/config';

const manifestForPlugIn = {
  registerType: 'prompt',
  includeAssests: ['favicon.ico', "apple-touch-icon.png", "masked-icon.svg"],
  manifest: {
    name: "Sequenced: ADHD Management",
    short_name: "Sequenced",
    description: "Sequenced ADHD Todo App",
    icons: [
      {
        src: '/assets/icons/icon-256.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'favicon'
      },
      {
        src: '/assets/icons/icon-256.webp',
        sizes: '180x180',
        type: 'image/webp',
        purpose: 'apple touch icon',
      },
    ],
    theme_color: '#307acf',
    background_color: '#FFFFFF',
    display: "standalone",
    scope: '/',
    start_url: "/",
    orientation: 'portrait'
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: process.env.VITE_PORT,
    allowedHosts: true
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  plugins: [react(), VitePWA(manifestForPlugIn)]
});
