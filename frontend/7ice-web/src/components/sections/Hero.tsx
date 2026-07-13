export default function Hero() {
  return (
    <section className="px-8 py-24">

      <div className="max-w-5xl">

        <p className="text-sm uppercase tracking-widest text-slate-500">
          Климатические решения нового поколения
        </p>


        <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-tight">
          Создаем идеальный климат
          <br />
          для дома и бизнеса
        </h1>


        <p className="mt-8 max-w-2xl text-xl text-slate-600">
          Продажа, установка и обслуживание климатических систем
          с контролем каждого этапа через цифровую платформу 7ice.
        </p>


        <div className="mt-10 flex flex-col sm:flex-row gap-4">

          <button className="rounded-full bg-slate-900 px-8 py-4 text-white">
            Получить расчет
          </button>


          <button className="rounded-full border border-slate-300 px-8 py-4">
            Посмотреть услуги
          </button>

        </div>


        <div className="mt-16 grid md:grid-cols-3 gap-6">


          <div className="rounded-3xl bg-slate-50 p-6">

            <div className="text-3xl font-bold">
              24/7
            </div>

            <p className="mt-2 text-slate-600">
              Контроль заявок и сервис
            </p>

          </div>


          <div className="rounded-3xl bg-slate-50 p-6">

            <div className="text-3xl font-bold">
              100%
            </div>

            <p className="mt-2 text-slate-600">
              Прозрачность работ
            </p>

          </div>


          <div className="rounded-3xl bg-slate-50 p-6">

            <div className="text-3xl font-bold">
              5 лет
            </div>

            <p className="mt-2 text-slate-600">
              Поддержка и гарантия
            </p>

          </div>


        </div>


      </div>

    </section>
  );
}