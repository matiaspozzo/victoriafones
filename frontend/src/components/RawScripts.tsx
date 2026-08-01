"use client";

import { useEffect } from "react";

/**
 * Renders admin-provided raw tracking-script HTML (SiteSetting.additional_scripts).
 * Browsers don't execute <script> tags injected via innerHTML, so any <script> in
 * the HTML is recreated as a real element and appended — the same trick every
 * "paste your tracking code here" CMS field relies on.
 */
export default function RawScripts({ html }: { html: string }) {
  useEffect(() => {
    const container = document.createElement("div");
    container.innerHTML = html;

    const scripts = Array.from(container.querySelectorAll("script"));
    const appended: HTMLElement[] = [];

    for (const node of Array.from(container.childNodes)) {
      if ((node as Element).tagName !== "SCRIPT") {
        const el = document.body.appendChild(node);
        appended.push(el as HTMLElement);
      }
    }

    for (const oldScript of scripts) {
      const newScript = document.createElement("script");
      for (const attr of Array.from(oldScript.attributes)) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      appended.push(newScript);
    }

    return () => {
      for (const el of appended) el.remove();
    };
  }, [html]);

  return null;
}
