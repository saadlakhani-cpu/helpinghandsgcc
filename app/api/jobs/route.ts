import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseJobsQuery } from "@/lib/jobs/parse-query";
import { queryJobs } from "@/lib/jobs/query-jobs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = parseJobsQuery(request.nextUrl.searchParams);
    const supabase = createAdminClient();
    const result = await queryJobs(supabase, params);

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
