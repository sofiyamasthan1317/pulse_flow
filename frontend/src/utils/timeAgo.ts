/**
 * Returns a human-friendly relative timestamp.
 * Examples: "Just now", "2 mins ago", "1 hour ago", "Yesterday", "Sep 20, 2026"
 */
export const timeAgo = (value?: string | null): string => {
  if (!value) return "";

  let date: Date;
  try {
    date = new Date(value);
    if (isNaN(date.getTime())) return value;
  } catch {
    return value;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 30) return "Just now";
  if (diffSec < 90) return "1 min ago";
  if (diffMin < 60) return `${diffMin} mins ago`;
  if (diffHr === 1) return "1 hour ago";
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  // Fall back to a readable absolute date for older entries
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};
