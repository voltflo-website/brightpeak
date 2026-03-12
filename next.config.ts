import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "*.spock.replit.dev",
    "*.riker.replit.dev",
    "*.worf.replit.dev",
    "*.picard.replit.dev",
    "*.kirk.replit.dev",
    "*.janeway.replit.dev",
    "127.0.0.1",
    "0.0.0.0",
  ],
  reactStrictMode: false,
  turbopack: {},
};

export default nextConfig;
