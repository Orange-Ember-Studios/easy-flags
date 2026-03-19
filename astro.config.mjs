import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";

const IS_DEV = process.env.NODE_ENV === "development";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: IS_DEV ? node({ mode: "standalone" }) : vercel(),
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    ssr: {
      external: ["bcryptjs", "jsonwebtoken"],
    },
  },
});
