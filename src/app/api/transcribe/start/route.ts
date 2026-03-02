import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient, SarvamAI } from "sarvamai";
import { writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

// Upload + job start should complete well within 60s
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const uid = randomUUID();
  const tempAudioPath = join(tmpdir(), `smriti-audio-${uid}.webm`);

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

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempAudioPath, buffer);

    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

    const initResult = await client.speechToTextJob.initialise({
      job_parameters: {
        model: "saaras:v3",
        mode: "codemix",
        ...(languageCode ? { language_code: languageCode as SarvamAI.SpeechToTextLanguage } : {}),
      },
    });

    const jobId = initResult.job_id;
    const job = client.speechToTextJob.getJob(jobId);

    await job.uploadFiles([tempAudioPath]);
    await job.start();

    return NextResponse.json({ jobId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start transcription.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await rm(tempAudioPath, { force: true }).catch(() => {});
  }
}
