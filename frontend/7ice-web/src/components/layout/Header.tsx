export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b bg-white">

      <div className="text-2xl font-bold tracking-tight">
        7ice
      </div>


      <nav className="hidden md:flex gap-8 text-sm text-slate-700">

        <a href="#">
          Услуги
        </a>

        <a href="#">
          О компании
        </a>

        <a href="#">
          Сервис
        </a>

        <a href="#">
          Контакты
        </a>

      </nav>


      <button className="rounded-full bg-slate-900 px-6 py-3 text-white text-sm">
        Получить расчет
      </button>


    </header>
  );
}