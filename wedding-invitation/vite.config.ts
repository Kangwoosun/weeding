import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import fs from "fs"

import pkg from "./package.json"
import { createHtmlPlugin } from "vite-plugin-html"
import {
  GROOM_FULLNAME,
  BRIDE_FULLNAME,
  WEDDING_DATE,
  LOCATION,
  WEDDING_DATE_FORMAT,
} from "./src/const"

const distFolder = "build"
const devServerPort = Number(process.env.VITE_DEV_SERVER_PORT || 3000)
const backendInternalUrl =
  process.env.VITE_BACKEND_INTERNAL_URL ||
  process.env.BACKEND_INTERNAL_URL ||
  "http://localhost:8080"
const publicInvitationUrl =
  process.env.VITE_INVITATION_URL || "http://woosuneunhye.c0w5un.xyz:65500/"

let base = "/"

if (process.env.VITE_BASE_PATH !== undefined) {
  base = process.env.VITE_BASE_PATH || "/"
} else {
  try {
    const url = new URL(pkg.homepage)
    base = url.pathname
  } catch (e) {
    base = pkg.homepage || "/"
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    createHtmlPlugin({
      inject: {
        data: {
          GROOM_FULLNAME,
          BRIDE_FULLNAME,
          DESCRIPTION: `${WEDDING_DATE.format(WEDDING_DATE_FORMAT)} ${LOCATION}`,
          INVITATION_URL: publicInvitationUrl,
          PREVIEW_IMAGE_URL: new URL(
            "preview_image.webp",
            publicInvitationUrl,
          ).toString(),
        },
      },
    }),
    {
      name: "manifest-inject",
      writeBundle() {
        const content = fs.readFileSync("public/manifest.json", "utf-8")
        const processed = content
          .replace(/<%= GROOM_FULLNAME %>/g, GROOM_FULLNAME)
          .replace(/<%= BRIDE_FULLNAME %>/g, BRIDE_FULLNAME)
        fs.writeFileSync(`${distFolder}/manifest.json`, processed)
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    port: devServerPort,
    allowedHosts: [
      "wedding-invitation",
      "localhost",
      "127.0.0.1",
      "woosuneunhye.c0w5un.xyz",
    ],
    proxy: {
      "/api": {
        target: backendInternalUrl,
        changeOrigin: true,
      },
    },
  },
  build: { outDir: distFolder },
  base,
})
