/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    serverComponentsExternalPackages: [
      "@remotion/bundler",
      "@remotion/renderer",
      "@ffmpeg-installer/ffmpeg",
      "@ffprobe-installer/ffprobe",
      "@mediapipe/tasks-vision",
      "puppeteer",
      "puppeteer-core",
      "fluent-ffmpeg",
      "ioredis",
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
