import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "English Adventure",
    short_name: "English Adventure",
    description: "Une aventure locale pour apprendre l’anglais en cinq minutes.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8f1dd",
    theme_color: "#638d42",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
