import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";
import { writeFile, readdir, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Batch jobs for long audio can take several minutes — raise the serverless timeout.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const uid = randomUUID();
  const tempAudioPath = join(tmpdir(), `smriti-audio-${uid}.webm`);
  const tempOutputDir = join(tmpdir(), `smriti-out-${uid}`);

  try {
    const incoming = await req.formData();
    const file = incoming.get("file") as Blob | null;
    const languageCode = incoming.get("language_code") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Transcription service not configured." }, { status: 500 });
    }

    // Write the incoming Blob to a temp file so the SDK can upload it by path.
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempAudioPath, buffer);

    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

    // Create the batch job.
    const job = await client.speechToTextJob.createJob({
      model: "saaras:v3",
      mode: "codemix",
      ...(languageCode ? { languageCode } : {}),
    });

    // Upload the audio file and start processing.
    await job.uploadFiles([tempAudioPath]);
    await job.start();
    await job.waitUntilComplete();

    // Check file-level results.
    const fileResults = await job.getFileResults();

    if (fileResults.failed.length > 0 && fileResults.successful.length === 0) {
      const msg = fileResults.failed[0]?.error_message ?? "Transcription failed.";
      return NextResponse.json({ error: String(msg) }, { status: 500 });
    }

    if (fileResults.successful.length === 0) {
      return NextResponse.json({ error: "No speech detected. Please try again." }, { status: 422 });
    }

    // Download the output JSON files.
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Always clean up temp files.
    await rm(tempAudioPath, { force: true }).catch(() => {});
    await rm(tempOutputDir, { recursive: true, force: true }).catch(() => {});
  }
}
