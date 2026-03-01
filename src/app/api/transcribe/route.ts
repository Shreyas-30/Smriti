import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const form = new FormData();
    form.append("file", file, "audio.webm");
    form.append("model", "saaras:v3");
    form.append("mode", "verbatim");
    if (languageCode) {
      form.append("language_code", languageCode);
    }

    const res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      // Sarvam may return errors as {message, code, request_id} or {error: {message, ...}}
      // Always extract a plain string so the client never receives an object.
      const message =
        typeof data?.message === "string" && data.message
          ? data.message
          : typeof data?.error === "string" && data.error
            ? data.error
            : typeof data?.error?.message === "string"
              ? data.error.message
              : "Transcription failed.";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const transcript: string = data.transcript ?? "";
    if (!transcript.trim()) {
      return NextResponse.json({ error: "No speech detected. Please try again." }, { status: 422 });
    }

    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
  }
}
