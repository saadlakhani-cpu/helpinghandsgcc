export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function formatHoursAgo(dateString: string | null): string {
  if (!dateString) return "recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffHours <= 0) return "just now";
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
}

export function isHotJob(datePosted: string): boolean {
  const posted = new Date(datePosted);
  const now = new Date();
  const diffHours = (now.getTime() - posted.getTime()) / (1000 * 60 * 60);
  return diffHours < 24;
}
