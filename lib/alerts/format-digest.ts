export type DigestJob = {
  id: string;
  title: string;
  company: string;
  country: string;
  city: string;
  category: string;
  slug: string;
  salary_range: string | null;
  work_type: string;
};

export function formatDigestEmail(
  subscriberName: string,
  jobs: DigestJob[],
  baseUrl: string
): { subject: string; html: string; text: string } {
  const count = jobs.length;
  const subject = `${count} new Gulf ${count === 1 ? "job" : "jobs"} matched for you`;

  const categoryColor = (cat: string) =>
    cat === "Finance" ? "#3B82F6" : "#8B5CF6";

  const jobRows = jobs
    .map(
      (j) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
          <a href="${baseUrl}/jobs/${j.slug}"
             style="font-size:15px;font-weight:600;color:#0F172A;text-decoration:none;display:block;margin-bottom:4px">
            ${j.title}
          </a>
          <span style="font-size:13px;color:#6b7280">${j.company} &middot; ${j.city}, ${j.country}</span>
          <br>
          <span style="font-size:12px;color:${categoryColor(j.category)};font-weight:500">${j.category}</span>
          ${j.salary_range ? `<span style="font-size:12px;color:#9ca3af"> &middot; ${j.salary_range}</span>` : ""}
          <span style="font-size:12px;color:#9ca3af"> &middot; ${j.work_type}</span>
        </td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">

    <!-- Header -->
    <div style="background:#0F172A;padding:20px 32px">
      <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">
        Gulf Finance &amp; AI Jobs
      </span>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">
      <p style="margin:0 0 8px;font-size:15px;color:#374151">Hi ${subscriberName},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151">
        We found <strong>${count} new ${count === 1 ? "role" : "roles"}</strong> that match your profile:
      </p>

      <table style="width:100%;border-collapse:collapse">
        ${jobRows}
      </table>

      <div style="margin-top:28px;text-align:center">
        <a href="${baseUrl}/jobs"
           style="display:inline-block;background:#0F172A;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">
          Browse All Jobs &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
        You&rsquo;re receiving this because you subscribed at Gulf Finance &amp; AI Jobs Portal.
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = [
    `Hi ${subscriberName},`,
    "",
    `We found ${count} new ${count === 1 ? "role" : "roles"} that match your profile:`,
    "",
    ...jobs.map(
      (j) =>
        `• ${j.title} — ${j.company}, ${j.city} ${j.country}\n  ${baseUrl}/jobs/${j.slug}`
    ),
    "",
    `Browse all jobs: ${baseUrl}/jobs`,
  ].join("\n");

  return { subject, html, text };
}
