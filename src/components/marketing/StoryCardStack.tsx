import Image from "next/image";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    chapter: "Chapter 3: Sundays on The Terrace",
    photos: ["/landing/photo-3.png", "/landing/photo-2.png", "/landing/photo-1.png"],
  },
  {
    chapter: "Chapter 2: The House That Learned Our Rhythms",
    photos: ["/landing/photo-2.png", "/landing/photo-1.png", "/landing/photo-3.png"],
  },
  {
    chapter: "Chapter 1: Chai, Power Cuts, and Promises",
    photos: ["/landing/photo-1.png", "/landing/photo-2.png", "/landing/photo-3.png"],
  },
];

function StoryCard({
  chapter,
  photos,
  className,
}: {
  chapter: string;
  photos: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute bg-white rounded-[20px] overflow-hidden",
        "shadow-[0px_-2px_4px_0px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      {/* Chapter title */}
      <div className="absolute top-[7%] left-[5%] right-[5%]">
        <p className="font-brand font-bold text-[#561d11] text-[clamp(14px,5vw,22px)] leading-tight tracking-tight">
          {chapter}
        </p>
      </div>

      {/* Audio progress bar */}
      <div className="absolute top-[42%] left-[5%] right-[5%]">
        <div className="relative h-[5px] bg-[#ebe5e2] rounded-full">
          <div className="absolute inset-y-0 left-0 w-[19%] bg-[#561d11] rounded-full" />
        </div>
        <p className="mt-0.5 ml-[18%] font-brand text-[#561d11] text-[7px]">
          0:19 / 6:55
        </p>
      </div>

      {/* Photo thumbnails */}
      <div className="absolute bottom-[4%] left-[3%] w-[42%] h-[52%]">
        {/* Back photo — slightly transparent, rotated clockwise */}
        <div className="absolute top-0 left-[8%] w-[62%] h-[55%] rotate-[9deg] opacity-70 overflow-hidden rounded-[3px]">
          <Image src={photos[0]} alt="" fill className="object-cover" />
        </div>
        {/* Left photo — rotated clockwise */}
        <div className="absolute top-[12%] left-0 w-[47%] h-[52%] rotate-[5deg] overflow-hidden rounded-[3px] shadow-sm">
          <Image src={photos[1]} alt="" fill className="object-cover" />
        </div>
        {/* Bottom photo — rotated counter-clockwise */}
        <div className="absolute bottom-0 left-[5%] w-[55%] h-[40%] -rotate-[4deg] overflow-hidden rounded-[3px] shadow-sm">
          <Image src={photos[2]} alt="" fill className="object-cover" />
        </div>
      </div>
    </div>
  );
}

export default function StoryCardStack() {
  return (
    <div className="relative w-full h-full">
      {/* Back card — topmost, rightmost */}
      <StoryCard
        chapter={CARDS[0].chapter}
        photos={CARDS[0].photos}
        className="top-0 left-[24%] w-[65%] h-[75%] opacity-[0.86]"
      />
      {/* Middle card */}
      <StoryCard
        chapter={CARDS[1].chapter}
        photos={CARDS[1].photos}
        className="top-[12%] left-[18%] w-[65%] h-[75%]"
      />
      {/* Front card — bottommost, leftmost */}
      <StoryCard
        chapter={CARDS[2].chapter}
        photos={CARDS[2].photos}
        className="top-[25%] left-[11%] w-[65%] h-[75%]"
      />
    </div>
  );
}
