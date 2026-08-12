"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const choices: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "自动" },
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
];

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  return preference === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolved;
  if (preference === "system") localStorage.removeItem("kamito-theme");
  else localStorage.setItem("kamito-theme", preference);
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    const current = document.documentElement.dataset.themePreference;
    const initial =
      current === "light" || current === "dark" || current === "system"
        ? current
        : "system";
    const frame = window.requestAnimationFrame(() => setPreference(initial));

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", onChange);
    };
  }, []);

  const currentIndex = choices.findIndex((choice) => choice.value === preference);
  const label = choices[currentIndex]?.label ?? "自动";

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`当前为${label}主题，点击切换`}
      title={`主题：${label}`}
      onClick={() => {
        const next = choices[(currentIndex + 1) % choices.length]?.value ?? "system";
        applyTheme(next);
        setPreference(next);
      }}
    >
      <span className="theme-dot" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
