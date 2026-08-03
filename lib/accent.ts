export function accent(color: string) {
  switch (color) {
    case "green":
      return {
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500",
        soft: "bg-emerald-50 dark:bg-emerald-950/50",
        border: "border-emerald-200 dark:border-emerald-900",
        badge: "green",
      };
    case "orange":
      return {
        text: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-500",
        soft: "bg-orange-50 dark:bg-orange-950/50",
        border: "border-orange-200 dark:border-orange-900",
        badge: "orange",
      };
    case "blue":
    default:
      return {
        text: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500",
        soft: "bg-blue-50 dark:bg-blue-950/50",
        border: "border-blue-200 dark:border-blue-900",
        badge: "blue",
      };
  }
}

export const STATUS_LABEL: Record<string, string> = {
  bloqueado: "Bloqueado",
  em_progresso: "Em progresso",
  dominado: "Dominado",
};
