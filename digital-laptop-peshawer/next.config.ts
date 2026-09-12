import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* This project lives inside a monorepo-style folder (C:\CODEX) that also
     contains other package-lock.json files. Point Turbopack at this project
     root so Next.js doesn't mis-detect the workspace root. */
  turbopack: {
    root: __dirname,
  },

  /* ------------------------------------------------------------------ *
   * pg uses native Node.js streams — mark it as a server-only external
   * package so Next.js does NOT try to bundle it into the Edge / RSC
   * runtime.  Without this, the Vercel build can fail with:
   *   "Module not found: Can't resolve 'pg'" or similar.
   * ------------------------------------------------------------------ */
  serverExternalPackages: ["pg"],

  /* Allow images from Cloudinary and any other external source. */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
