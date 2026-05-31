import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              displayName: true,
              fileName: false,
              cssProp: true,
            },
          ],
        ],
      },
    }),
  ],
  server: {
    port: 3000,
     proxy: {
      "/api": {
        target: "https://nf5vrtmgfieecoc3kewsih2yem0wclkd.lambda-url.us-east-2.on.aws",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/llm-api": {
        target: "http://ec2-18-227-26-212.us-east-2.compute.amazonaws.com:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm-api/, ""),
      },
      "/llm-token": {
        target: "https://us-east-2592kdp0dv.auth.us-east-2.amazoncognito.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm-token/, ""),
      },
    },
  },
  resolve: {
    alias: {
      src: "/src",
      assets: "/src/assets",
      components: "/src/components",
      containers: "/src/containers",
      features: "/src/features",
      hooks: "/src/hooks",
      lib: "/src/lib",
      models: "/src/models",
      pages: "/src/pages",
      routes: "/src/routes",
      services: "/src/services",
      store: "/src/store",
      styles: "/src/styles",
      translations: "/src/translations",
      utils: "/src/utils",
    },
  },
});
