import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BatteryFull, Ellipsis, RotateCw, Wifi } from "lucide-react";

function CellularBars() {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      <span className="h-[4px] w-[3px] rounded-sm bg-[#111111]" />
      <span className="h-[6px] w-[3px] rounded-sm bg-[#111111]" />
      <span className="h-[8px] w-[3px] rounded-sm bg-[#111111]" />
      <span className="h-[10px] w-[3px] rounded-sm bg-[#111111]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#E7E2D8] px-4 py-6 sm:py-8">
      <section className="relative mx-auto aspect-[393/852] w-full max-w-[393px] overflow-hidden bg-[#E7E2D8]">
        <div className="absolute left-0 top-0 flex h-[7.3%] w-full items-start justify-between px-[6.4%] pt-[2%] text-[17px] font-semibold text-[#111111]">
          <span>9:41</span>
          <div className="mt-[2px] flex items-center gap-[7px]" aria-hidden>
            <CellularBars />
            <Wifi className="h-[15px] w-[15px] stroke-[2.4]" />
            <BatteryFull className="h-[18px] w-[18px] stroke-[2.1]" />
          </div>
        </div>

        <div
          className="absolute"
          style={{
            left: "-7.12%",
            top: "6.22%",
            width: "107.12%",
            height: "49.53%",
          }}
        >
          <div
            className="absolute overflow-hidden rounded-[9px] border-[6px] border-[#F4EDE2] shadow-[0_10px_24px_rgba(51,30,25,0.16)]"
            style={{
              left: "10.2%",
              top: "12.56%",
              width: "52.9%",
              height: "44.65%",
            }}
          >
            <Image
              src="/landing/photo-1.png"
              alt="Family memory photo"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div
            className="absolute overflow-hidden rounded-[9px] border-[6px] border-[#F4EDE2] shadow-[0_10px_24px_rgba(51,30,25,0.16)]"
            style={{
              left: "55.63%",
              top: "29.88%",
              width: "37.72%",
              height: "45.85%",
            }}
          >
            <Image
              src="/landing/photo-2.png"
              alt="Portrait memory photo"
              fill
              className="object-cover"
            />
          </div>

          <div
            className="absolute overflow-hidden rounded-[9px] border-[6px] border-[#F4EDE2] shadow-[0_10px_24px_rgba(51,30,25,0.16)]"
            style={{
              left: "-6.65%",
              top: "67.39%",
              width: "73.16%",
              height: "54.07%",
            }}
          >
            <Image
              src="/landing/photo-3.png"
              alt="Outdoor memory photo"
              fill
              className="object-cover"
            />
          </div>

          <div
            className="absolute overflow-hidden"
            style={{
              left: "69.2%",
              top: "71.84%",
              width: "22.65%",
              height: "25.46%",
            }}
          >
            <Image
              src="/landing/stamp.png"
              alt="India postage stamp"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div
          className="absolute flex flex-col items-center text-center"
          style={{
            left: "5.34%",
            top: "56.69%",
            width: "89.31%",
            height: "27.82%",
          }}
        >
          <div className="w-full">
            <h1 className="font-serif text-[clamp(4.3rem,22vw,5.75rem)] leading-[1.02] tracking-tight text-[#5C1F1A]">
              Smriti
            </h1>
            <p className="-mt-2 px-3 text-[clamp(0.95rem,4vw,1rem)] leading-[1.35] text-[#5C1F1A]/85">
              Helping you document your family&apos;s rich stories and history
            </p>
          </div>

          <Link
            href="/signup"
            className="mt-[6%] inline-flex h-[50px] w-[82.91%] items-center justify-center rounded-full bg-[#5C1F1A] px-6 text-[clamp(1rem,4vw,1.05rem)] font-medium text-[#F7EEE4] transition active:scale-[0.99]"
          >
            Get started
          </Link>

          <p className="mt-[6%] text-[clamp(0.92rem,3.8vw,1rem)] text-[#5C1F1A]/85">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium underline underline-offset-4"
            >
              Sign In!
            </Link>
          </p>
        </div>

        <div
          className="absolute flex items-center gap-2"
          style={{
            left: "7.63%",
            top: "91.31%",
            width: "84.99%",
            height: "5.63%",
          }}
          aria-hidden
        >
          <button
            type="button"
            className="grid h-full w-[44px] place-items-center rounded-full bg-[#F5F5F3] text-[#111111]"
            tabIndex={-1}
          >
            <ArrowLeft className="h-[18px] w-[18px] stroke-[2.2]" />
          </button>

          <div className="flex h-full flex-1 items-center justify-between rounded-full bg-[#F5F5F3] px-4 text-[15px] font-medium text-[#111111]">
            <span className="truncate">smritistories.com</span>
            <RotateCw className="h-[15px] w-[15px] stroke-[2.2]" />
          </div>

          <button
            type="button"
            className="grid h-full w-[44px] place-items-center rounded-full bg-[#F5F5F3] text-[#111111]"
            tabIndex={-1}
          >
            <Ellipsis className="h-[18px] w-[18px] stroke-[2.2]" />
          </button>
        </div>
      </section>
    </main>
  );
}
