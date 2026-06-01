import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claudeJsonOnly } from "@/lib/claude/messages";
import { extractTextFromPdfBuffer } from "@/lib/resume/pdf-text";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT =
  "You are a resume parser. Extract information and return ONLY valid JSON with no preamble or markdown.\n" +
  "Required fields:\n" +
  "{\n" +
  "  name: string,\n" +
  "  email: string,\n" +
  "  whatsapp: string or null,\n" +
  "  current_role: string,\n" +
  "  experience_years: number,\n" +
  "  certifications: array of strings,\n" +
  "  skills: array of strings,\n" +
  "  preferred_country: string or null\n" +
  "}\n" +
  "If a field cannot be found, use null.";

export async function POST(request: NextRequest) {
  try {
    // Guard: resume parsing requires Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Resume parsing is not available yet. Please try again later." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with file field named 'file'" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromPdfBuffer(bytes);

    if (!extractedText) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeName = (file.name || "resume.pdf").replace(/[^\w.\-]/g, "_");
    const path = `uploads/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage
      .from("resumes")
      .getPublicUrl(path);

    const resume_url = publicData.publicUrl || path;

    const parsed = await claudeJsonOnly(
      SYSTEM_PROMPT,
      `Extract from this resume text:\n\n${extractedText}`
    );

    // STEP 8 requirement: return draft only; do not write to DB yet.
    return NextResponse.json({
      resume_url,
      parsed,
      extracted_chars: extractedText.length,
    });

  } catch (error) {
    console.error("POST /api/parse-resume error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Resume parse failed" },
      { status: 500 }
    );
  }
}