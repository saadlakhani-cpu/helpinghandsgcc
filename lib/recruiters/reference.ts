// Display reference only; database operations always use the complete UUID.
export function recruiterReference(id: string) {
  return `JOB-${id.slice(0, 8).toUpperCase()}`;
}
