import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
