import { NextRequest, NextResponse } from "next/server";
import { getJobBySlug } from "@/lib/jobs/get-job";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { slug: string };
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const job = await getJobBySlug(params.slug);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("GET /api/jobs/[slug] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch job" },
      { status: 500 }
    );
  }
}
