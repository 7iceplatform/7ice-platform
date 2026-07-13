import { Container } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function CatalogCTA() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="flex flex-col items-center rounded-[32px] bg-[#0F1723] px-8 py-16 text-center text-white xl:px-20">
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Нужна помощь с выбором?
          </span>

          <h2 className="mt-4 text-3xl font-bold xl:text-4xl">
            Подберем решение под ваш объект
          </h2>

          <p className="mt-5 max-w-[480px] text-base leading-7 text-white/70">
            Оставьте заявку — инженер свяжется в течение 15 минут,
            рассчитает мощность и предложит оптимальный вариант.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg">Получить расчет</Button>
            <Button size="lg" variant="ghost">
              Позвонить нам
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
