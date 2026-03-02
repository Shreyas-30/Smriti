import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";
import { readdir, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId." }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Transcription service not configured." }, { status: 500 });
  }

  try {
    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
    const status = await client.speechToTextJob.getStatus(jobId);

    if (status.job_state === "Completed") {
      const tempOutputDir = join(tmpdir(), `smriti-out-${randomUUID()}`);
      try {
        const job = client.speechToTextJob.getJob(jobId);
        await job.downloadOutputs(tempOutputDir);

        const outputFiles = await readdir(tempOutputDir);
        const jsonFile = outputFiles.find((f) => f.endsWith(".json"));
        if (!jsonFile) {
          return NextResponse.json({ error: "Failed to retrieve transcript." }, { status: 500 });
        }

        const raw = await readFile(join(tempOutputDir, jsonFile), "utf-8");
        const data = JSON.parse(raw);
        const transcript: string = data.transcript ?? "";

        if (!transcript.trim()) {
          return NextResponse.json({ error: "No speech detected. Please try again." }, { status: 422 });
        }

        return NextResponse.json({ transcript });
      } finally {
        await rm(tempOutputDir, { recursive: true, force: true }).catch(() => {});
      }
    }

    if (status.job_state === "Failed") {
      const msg = status.error_message ?? "Transcription failed.";
      return NextResponse.json({ error: String(msg) }, { status: 500 });
    }

    // Accepted | Pending | Running — still processing
    return NextResponse.json({ status: "processing" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to check transcription status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
