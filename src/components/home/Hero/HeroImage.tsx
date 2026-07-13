import Image from "next/image";

export function HeroImage() {
  return (
    <>
      <div className="absolute h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl" />

      <Image
        src="/images/hero/air-conditioner.png"
        alt="Кондиционер"
        width={900}
        height={540}
        priority
        className="relative z-10 scale-125 object-contain"
      />

      <span className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
        Кондиционер
      </span>
    </>
  );
}
