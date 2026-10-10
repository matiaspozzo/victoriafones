import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Everything is already open to every crawler via the "*" rule below — these
// entries don't change that, they just make the intent to be crawled and
// cited by AI answer engines explicit rather than implicit, which is easier
// to audit later than inferring it from the absence of a Disallow.
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...AI_USER_AGENTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
