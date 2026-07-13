import { Container } from "@/components/layout";

export function PortfolioHero() {
  return (
    <section className="relative overflow-hidden bg-[#0F1723] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2563EB22,transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0F1723,#121417)]" />

      <Container size="wide">
        <div className="relative z-10 py-20 xl:py-28">
          <span className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Наши работы
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
            Портфолио
            <br />
            проектов
          </h1>

          <p className="mt-8 max-w-[560px] text-lg leading-8 text-white/70">
            Более 500 выполненных проектов — от квартир до промышленных объектов.
            Каждый проект — это индивидуальный подход и гарантия качества.
          </p>
        </div>
      </Container>
    </section>
  );
}
