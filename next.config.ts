import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development-only "N" badge; bottom-left sits on top of the sidebar's sign-out button.
  devIndicators: { position: "bottom-right" },
  experimental: {
    serverActions: {
      // Question/option image uploads go through a Server Action; the backend
      // caps images at 5 MB (radiance-backend/lib/uploads.ts), plus form overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
