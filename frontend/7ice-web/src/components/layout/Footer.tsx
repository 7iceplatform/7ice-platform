export default function Footer() {
  return (
    <footer className="border-t px-8 py-12">

      <div className="max-w-6xl grid md:grid-cols-3 gap-8">

        <div>
          <div className="text-2xl font-bold">
            7ice
          </div>

          <p className="mt-4 text-slate-600">
            Технологичный сервис климатических решений
            для дома и бизнеса.
          </p>
        </div>


        <div>
          <h3 className="font-semibold">
            Услуги
          </h3>

          <ul className="mt-4 space-y-2 text-slate-600">
            <li>Кондиционирование</li>
            <li>Монтаж</li>
            <li>Сервис</li>
            <li>Проектирование</li>
          </ul>
        </div>


        <div>
          <h3 className="font-semibold">
            Контакты
          </h3>

          <ul className="mt-4 space-y-2 text-slate-600">
            <li>Москва и Московская область</li>
            <li>Продажа и монтаж климатических систем</li>
            <li>7ice.pro</li>
          </ul>
        </div>


      </div>


      <div className="mt-12 border-t pt-6 text-sm text-slate-500">
        © 2026 7ice. Все права защищены.
      </div>

    </footer>
  );
}