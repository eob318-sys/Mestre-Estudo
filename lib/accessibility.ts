export type ContrastMode = "normal" | "high";
export type FontScale = "100" | "115" | "130";

export const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: "100", label: "100%" },
  { value: "115", label: "115%" },
  { value: "130", label: "130%" },
];

export function applyAccessibility(contrast: ContrastMode, fontScale: FontScale): void {
  const root = document.documentElement;
  root.classList.toggle("contrast-high", contrast === "high");
  root.dataset.fontScale = fontScale;
  try {
    localStorage.setItem("accessibility-contrast", contrast);
    localStorage.setItem("accessibility-font", fontScale);
  } catch {
    // armazenamento indisponível — segue sem persistir
  }
}

export function loadAccessibility(): {
  contrast: ContrastMode;
  fontScale: FontScale;
} {
  let contrast: ContrastMode = "normal";
  let fontScale: FontScale = "100";
  try {
    const c = localStorage.getItem("accessibility-contrast");
    const f = localStorage.getItem("accessibility-font");
    if (c === "high" || c === "normal") contrast = c;
    if (f === "115" || f === "130") fontScale = f;
  } catch {
    // armazenamento indisponível — padrão
  }
  return { contrast, fontScale };
}
