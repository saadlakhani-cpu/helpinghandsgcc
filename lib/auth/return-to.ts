export function getSafeReturnPath(returnTo: string): string {
  if (/[\\\x00-\x20]/.test(returnTo)) return "/jobs";
  if (!returnTo.startsWith("/") || returnTo.startsWith("//")) return "/jobs";
  if (returnTo.startsWith("/admin")) return "/jobs";
  if (returnTo.startsWith("/api")) return "/jobs";
  if (returnTo.startsWith("/manual-import")) return "/jobs";
  return returnTo;
}
