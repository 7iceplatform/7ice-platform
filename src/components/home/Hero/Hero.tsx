import { Container } from "@/components/layout";

import { HeroBackground } from "./HeroBackground";
import { HeroCalculator } from "./HeroCalculator";
import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0F1723] text-white">
      <HeroBackground />

      <Container size="wide">
        <div className="grid min-h-[760px] grid-cols-1 gap-10 py-20 xl:grid-cols-[1.2fr_1fr_420px]">

  <HeroContent />

  <HeroImage />

  <HeroCalculator />

</div>
      </Container>
    </section>
  );
}