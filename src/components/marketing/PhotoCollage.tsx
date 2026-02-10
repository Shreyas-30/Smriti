import Image from "next/image";

export default function PhotoCollage() {
  return (
    <div className="relative mx-auto h-72 w-full max-w-md">
      {/* Top-left */}
      <div className="absolute left-0 top-2 w-9/12 -rotate-6 rounded-md bg-white p-2 shadow-lg">
        <div className="relative h-40 w-full overflow-hidden rounded">
          <Image
            src="/landing/photo-1.png"
            alt="Family photo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Top-right */}
      <div className="absolute right-0 top-10 w-5/12 rotate-6 rounded-md bg-white p-2 shadow-lg">
        <div className="relative h-44 w-full overflow-hidden rounded">
          <Image
            src="/landing/photo-2.png"
            alt="Portrait photo"
            fill
            className="object-cover grayscale"
          />
        </div>
      </div>

      {/* Bottom-left */}
      <div className="absolute bottom-0 left-4 w-10/12 rotate-3 rounded-md bg-white p-2 shadow-lg">
        <div className="relative h-32 w-full overflow-hidden rounded">
          <Image
            src="/landing/photo-3.png"
            alt="Outdoor photo"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Stamp */}
      <div className="absolute bottom-6 right-4 w-20 -rotate-12 opacity-95">
        <div className="relative h-20 w-20">
          <Image
            src="/landing/stamp.png"
            alt="Stamp"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
