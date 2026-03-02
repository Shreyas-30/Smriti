export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function extractTitle(content: string): string {
  const firstSentence = content.split(/[.!?]/)[0].trim();
  const words = firstSentence.split(/\s+/);
  if (words.length <= 6) return firstSentence;
  return words.slice(0, 5).join(" ") + "…";
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
