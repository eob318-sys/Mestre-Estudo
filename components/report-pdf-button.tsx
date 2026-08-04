"use client";

import { Button } from "@/components/ui";

/** Abre a versão para impressão do relatório em nova aba (gera PDF via janela de impressão). */
export function ReportPdfButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const win = window.open("/relatorios/imprimir", "_blank");
        if (win) win.focus();
      }}
    >
      Baixar PDF
    </Button>
  );
}