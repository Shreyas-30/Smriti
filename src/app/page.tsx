import Link from "next/link";
import PhotoCollage from "@/components/marketing/PhotoCollage";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#F4EFE6]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-10">
        <div className="mt-4">
          <PhotoCollage />
        </div>

        <div className="mt-10 text-center">
          <h1 className="font-serif text-5xl leading-none tracking-tight text-[#4A1F17]">
            Smriti
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-[#6B3A2B]">
            Helping you document your family’s rich stories and history
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/start"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#4A1F17] px-6 text-base font-medium text-[#F4EFE6] shadow-sm transition active:scale-[0.99]"
          >
            Get Started
          </Link>

          <p className="text-sm text-[#6B3A2B]">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="underline underline-offset-4 hover:opacity-90"
            >
              Sign In!
            </Link>
          </p>
        </div>

        <div className="mt-auto" />
      </div>
    </main>
  );
}
