export function calculateFreshnessScore(
  sourcePriority: number,
  datePosted: string
): number {
  const posted = new Date(datePosted);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  posted.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysOld = Math.max(
    0,
    Math.floor((today.getTime() - posted.getTime()) / msPerDay)
  );

  return sourcePriority / (daysOld + 1);
}
