import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchJobsForSubscriber } from "@/lib/alerts/match-jobs";

export const dynamic = "force-dynamic";

export { POST as GET };

const BATCH_SIZE = 50;

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("id, preferred_category, preferred_country, preferred_subcategory")
    .limit(BATCH_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ subscribers_processed: 0, total_matched: 0 });
  }

  const results = await Promise.all(
    subscribers.map((subscriber) =>
      matchJobsForSubscriber(supabase, subscriber)
    )
  );

  const total_matched = results.reduce((sum, r) => sum + r.matched, 0);

  return NextResponse.json({
    subscribers_processed: subscribers.length,
    total_matched,
  });
}
