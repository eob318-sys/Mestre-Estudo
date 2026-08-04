"use client";

import { useEffect } from "react";

/** Dispara a impressão do navegador ao abrir a página (para "Salvar como PDF"). */
export function AutoPrint() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}