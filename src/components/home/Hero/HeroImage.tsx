import Image from "next/image";

export function HeroImage() {
  return (
    <div className="relative flex items-center justify-center">

      <div className="absolute h-[520px] w-[520px] rounded-full bg-blue-500/15 blur-3xl" />

      <Image
        src="/images/hero/air-conditioner.png"
        alt="Кондиционер"
        width={900}
height={540}
className="relative z-10 scale-125 object-contain"
      />

    </div>
  );
}