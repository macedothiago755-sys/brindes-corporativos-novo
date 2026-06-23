export function scoreColor(score: number): { bg: string; text: string; ring: string } {
  if (score > 70) return { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" };
  if (score >= 50) return { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" };
  return { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200" };
}

export function ScoreBadge({ score }: { score: number }) {
  const c = scoreColor(score);
  return (
    <span
      className={`inline-flex h-9 w-12 items-center justify-center rounded-lg text-sm font-bold ring-1 ${c.bg} ${c.text} ${c.ring}`}
    >
      {score}
    </span>
  );
}
