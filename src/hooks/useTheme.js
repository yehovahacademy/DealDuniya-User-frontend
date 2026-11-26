import { useCallback, useEffect, useState } from "react";

// Light / dark theme, stored as data-theme on <html> (index.css has the tokens for both).
// The user's choice is remembered; until they pick one we follow the OS setting.
// index.html sets data-theme before React loads, so there's no flash of the wrong theme.
const KEY = "theme";

const stored = () => {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
};

const systemTheme = () => (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export default function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || stored() || systemTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow OS changes only while the user hasn't chosen; keep every toggle on the page in sync.
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onSystem = () => !stored() && setTheme(systemTheme());
    const onSync = (e) => setTheme(e.detail);
    mq?.addEventListener("change", onSystem);
    window.addEventListener("themechange", onSync);
    return () => {
      mq?.removeEventListener("change", onSystem);
      window.removeEventListener("themechange", onSync);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable — still switch for this visit */
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  }, []);

  return [theme, toggle];
}
