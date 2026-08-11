"use client";

import { useEffect } from "react";

export function CodeCopyButtons() {
  useEffect(() => {
    const figures = document.querySelectorAll<HTMLElement>(
      "figure[data-rehype-pretty-code-figure]",
    );
    const cleanups: Array<() => void> = [];

    figures.forEach((figure) => {
      if (figure.querySelector(".copy-code-button")) return;
      const code = figure.querySelector("code");
      if (!code) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-button";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");

      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent ?? "");
          button.textContent = "已复制";
          window.setTimeout(() => (button.textContent = "复制"), 1600);
        } catch {
          button.textContent = "复制失败";
        }
      };
      button.addEventListener("click", onClick);
      figure.append(button);
      cleanups.push(() => button.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
