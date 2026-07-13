export function HeroCalculator() {
  return (
    <aside className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

      <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
        Быстрый подбор
      </span>

      <h3 className="mt-4 text-3xl font-bold text-white">
        Подберем решение
        <br />
        за 2 минуты
      </h3>

      <p className="mt-5 text-sm leading-7 text-white/70">
        Ответьте на несколько вопросов —
        мы предложим подходящее оборудование
        и ориентировочную стоимость.
      </p>

      <div className="mt-10 space-y-4">

        <button className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-white hover:bg-white/10">
          🏠 Квартира
        </button>

        <button className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-white hover:bg-white/10">
          🏡 Частный дом
        </button>

        <button className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-white hover:bg-white/10">
          🏢 Офис
        </button>

      </div>

    </aside>
  );
}