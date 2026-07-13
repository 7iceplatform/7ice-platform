export default function Advantages() {
  const advantages = [
    {
      title: "Цифровой контроль",
      description:
        "Каждый этап заказа фиксируется в системе: заявка, расчет, монтаж и сервис.",
    },
    {
      title: "Прозрачная стоимость",
      description:
        "Клиент получает понятный расчет до начала работ без скрытых доплат.",
    },
    {
      title: "Стандарты монтажа",
      description:
        "Работа выполняется по единому стандарту качества 7ice.",
    },
    {
      title: "Поддержка после установки",
      description:
        "Мы остаемся с клиентом после монтажа: обслуживание, гарантия и помощь.",
    },
  ];

  return (
    <section className="px-8 py-24">

      <div className="max-w-6xl">

        <p className="text-sm uppercase tracking-widest text-slate-500">
          Почему 7ice
        </p>


        <h2 className="mt-4 text-4xl font-bold">
          Не просто монтаж.
          <br />
          Полный сервис климатических решений.
        </h2>


        <div className="mt-12 grid md:grid-cols-2 gap-6">

          {advantages.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border p-8"
            >

              <h3 className="text-2xl font-semibold">
                {item.title}
              </h3>


              <p className="mt-4 text-slate-600">
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}