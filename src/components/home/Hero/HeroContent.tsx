import { Button } from "@/components/ui/button";
import { HeroFeatures } from "./HeroFeatures";

export function HeroContent() {
  return (
    <div className="relative z-10 max-w-[620px]">

      <span className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
        Цифровая климатическая платформа
      </span>

      <h1 className="mt-6 text-6xl font-extrabold leading-[1.05] tracking-tight">
        Создаем идеальный
        <br />
        климат для жизни
        <br />
        и бизнеса
      </h1>

      <p className="mt-8 max-w-[560px] text-lg leading-8 text-white/70">
        Проектируем, поставляем, устанавливаем и обслуживаем
        климатические системы через единую цифровую платформу
        7ice.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">

        <Button size="lg">
          Получить расчет
        </Button>

        <Button
          size="lg"
          variant="ghost"
        >
          Каталог оборудования
        </Button>

      </div>
        <HeroFeatures />
    </div>
  );
}