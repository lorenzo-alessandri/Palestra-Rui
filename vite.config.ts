import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const single = process.env.SINGLE === "1";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile()] : [])],
  define: { __ANTEPRIMA__: JSON.stringify(single) },
  build: single ? { assetsInlineLimit: 100000000, cssCodeSplit: false } : {},
});
