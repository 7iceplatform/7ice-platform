import { Container } from "@/components/layout";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#0F1723] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2563EB22,transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0F1723,#121417)]" />

      <Container size="wide">
        <div className="relative z-10 py-20 xl:py-28">
          <span className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            О нас
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
            Создаем идеальный
            <br />
            климат с 2018 года
          </h1>

          <p className="mt-8 max-w-[600px] text-lg leading-8 text-white/70">
            7ice — это цифровая платформа для проектирования, установки
            и обслуживания климатических систем. Мы объединяем экспертизу,
            технологии и заботу о клиентах.
          </p>
        </div>
      </Container>
    </section>
  );
}
