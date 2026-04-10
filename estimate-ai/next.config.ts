import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this project — a stray package-lock.json
  // at C:/Business/ otherwise makes Next infer the wrong root and emit a warning.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
