import Image from "next/image";

export default function PhotoCollage() {
  return (
    <div className="relative h-full w-full overflow-visible">
      {/* Photo 1 — top-left, tilted clockwise (+7°) */}
      <div className="absolute left-0 top-0 w-[57%] rotate-[7deg] rounded-sm bg-white p-1.5 shadow-md">
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2px]">
          <Image
            src="/landing/photo-1.png"
            alt="Family photo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Photo 2 — top-right, tilted counter-clockwise (-5°) */}
      <div className="absolute right-0 top-[14%] w-[40%] -rotate-[5deg] rounded-sm bg-white p-1.5 shadow-md">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px]">
          <Image
            src="/landing/photo-2.png"
            alt="Portrait photo"
            fill
            className="object-cover grayscale"
          />
        </div>
      </div>

      {/* Photo 3 — middle-left, tilted counter-clockwise (-8°) */}
      <div className="absolute left-0 top-[45%] w-[78%] -rotate-[8deg] rounded-sm bg-white p-1.5 shadow-md">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[2px]">
          <Image
            src="/landing/photo-3.png"
            alt="Outdoor photo"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Stamp — right side, tilted clockwise (+12°) */}
      <div className="absolute right-[4%] top-[57%] w-[22%] rotate-[12deg]">
        <div className="relative aspect-[5/6] w-full">
          <Image
            src="/landing/stamp.png"
            alt="Vintage India stamp"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
