export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

// Figma palette: maps stored hex → { bg (light), text (dark) }
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  "#1f6f43": { bg: "#E0FAE9", text: "#124B2B" },
  "#2563eb": { bg: "#DBEAFE", text: "#1D4ED8" },
  "#9333ea": { bg: "#F3E8FF", text: "#7E22CE" },
  "#db2777": { bg: "#FCE7F3", text: "#BE185D" },
  "#dc2626": { bg: "#FEE2E2", text: "#B91C1C" },
  "#ea580c": { bg: "#FFEDD5", text: "#C2410C" },
  "#ca8a04": { bg: "#F7F3CA", text: "#A16207" },
  "#16a34a": { bg: "#E0FAE9", text: "#15803D" },
  "#6b7280": { bg: "#F3F4F6", text: "#4B5563" },
  "#111827": { bg: "#F3F4F6", text: "#374151" },
};

export function catStyle(color?: string | null): { bg: string; text: string } {
  if (!color) return { bg: "#F3F4F6", text: "#4B5563" };
  return COLOR_MAP[color.toLowerCase()] ?? { bg: `${color}20`, text: color };
}
