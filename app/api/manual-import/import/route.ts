import { NextRequest, NextResponse } from "next/server";
import { importJobLinks } from "@/lib/ingest/import-job-links";
import {
  MANUAL_IMPORT_USER_COOKIE,
  isManualImportRequestAuthorized,
} from "@/lib/manual-import/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isManualImportRequestAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const supabase = createAdminClient();
  const { data: keywords, error: keywordsError } = await supabase
    .from("keywords")
    .select("keyword, category, subcategory, match_field");

  if (keywordsError) {
    return NextResponse.json({ error: keywordsError.message }, { status: 500 });
  }

  const importedBy =
    request.cookies.get(MANUAL_IMPORT_USER_COOKIE)?.value || "manual-import";

  const result = await importJobLinks({
    supabase,
    rawLinks: body.links,
    keywordRows: keywords ?? [],
    importedBy,
  });

  return NextResponse.json(result);
}
