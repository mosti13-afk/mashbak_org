import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "مشبك | Mashbak",
    short_name: "مشبك",
    description: "شبكتك المهنية، بجيبتك. Your professional network, in your pocket.",
    start_url: "/app?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "ar",
    background_color: "#f6f8f7",
    theme_color: "#0a476d",
    categories: ["business", "social", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "الوظائف · Jobs", short_name: "الوظائف", url: "/app/jobs", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "الفعاليات · Events", short_name: "الفعاليات", url: "/app/events", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "الأعضاء · Members", short_name: "الأعضاء", url: "/app/members", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
