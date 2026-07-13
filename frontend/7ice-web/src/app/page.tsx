export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b">
        <div className="text-2xl font-bold tracking-tight">
          7ice
        </div>

        <nav className="hidden md:flex gap-8 text-sm">
          <a href="#">Услуги</a>
          <a href="#">О компании</a>
          <a href="#">Сервис</a>
          <a href="#">Контакты</a>
        </nav>

        <button className="rounded-full bg-slate-900 px-6 py-3 text-white">
          Получить расчет
        </button>
      </header>


      {/* Hero */}
      <section className="px-8 py-24">

        <div className="max-w-5xl">

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Создаем идеальный климат
            <br />
            для дома и бизнеса
          </h1>


          <p className="mt-8 max-w-2xl text-xl text-slate-600">
            Продажа, установка и обслуживание климатических систем
            с цифровым контролем каждого этапа.
          </p>


          <div className="mt-10 flex gap-4">

            <button className="rounded-full bg-slate-900 px-8 py-4 text-white">
              Получить расчет
            </button>


            <button className="rounded-full border px-8 py-4">
              Наши услуги
            </button>

          </div>

        </div>

      </section>


      {/* Services */}
      <section className="px-8 py-20 bg-slate-50">

        <h2 className="text-3xl font-bold">
          Услуги 7ice
        </h2>


        <div className="mt-10 grid md:grid-cols-3 gap-6">

          <div className="rounded-3xl bg-white p-8">
            <h3 className="text-xl font-semibold">
              Продажа оборудования
            </h3>

            <p className="mt-4 text-slate-600">
              Подбор климатической техники
              под ваш объект.
            </p>
          </div>


          <div className="rounded-3xl bg-white p-8">
            <h3 className="text-xl font-semibold">
              Монтаж
            </h3>

            <p className="mt-4 text-slate-600">
              Профессиональная установка
              с гарантией.
            </p>
          </div>


          <div className="rounded-3xl bg-white p-8">
            <h3 className="text-xl font-semibold">
              Сервис
            </h3>

            <p className="mt-4 text-slate-600">
              Обслуживание и поддержка
              после установки.
            </p>
          </div>

        </div>

      </section>


      {/* Footer */}
      <footer className="px-8 py-10 border-t">
        <div className="font-bold">
          7ice
        </div>

        <p className="mt-2 text-slate-500">
          Технологичный сервис климатических решений.
        </p>
      </footer>


    </main>
  );
}