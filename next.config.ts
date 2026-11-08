import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Cloud Run / Firebase App Hosting
  output: "standalone",
  poweredByHeader: false,
  // Keep the live site's member URLs working after the switch (NFC keychains, bookmarks, emails)
  async redirects() {
    return [
      { source: "/:locale(ar|en|he)/dashboard", destination: "/:locale/app", permanent: false },
      { source: "/:locale(ar|en|he)/dashboard/contact", destination: "/:locale/contact", permanent: false },
      { source: "/:locale(ar|en|he)/jobs/:path*", destination: "/:locale/app/jobs/:path*", permanent: false },
      { source: "/:locale(ar|en|he)/profile/:path*", destination: "/:locale/app/profile", permanent: false },
      { source: "/:locale(ar|en|he)/notifications", destination: "/:locale/app/notifications", permanent: false },
      { source: "/:locale(ar|en|he)/settings", destination: "/:locale/app/profile", permanent: false },
      { source: "/:locale(ar|en|he)/programs", destination: "/:locale/our_programs", permanent: true },
      { source: "/:locale(ar|en|he)/apply", destination: "/:locale/application", permanent: true },
      { source: "/:locale(ar|en|he)/privacy", destination: "/:locale/policy", permanent: true },
    ];
  },
};

export default nextConfig;
