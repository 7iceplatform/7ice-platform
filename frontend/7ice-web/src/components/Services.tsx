export default function Services() {
  const services = [
    {
      title: "Продажа оборудования",
      description:
        "Подбор кондиционеров и климатических систем под особенности вашего объекта.",
    },
    {
      title: "Профессиональный монтаж",
      description:
        "Установка оборудования с соблюдением технологий и стандартов качества.",
    },
    {
      title: "Сервисное обслуживание",
      description:
        "Чистка, диагностика, ремонт и поддержка климатических систем.",
    },
    {
      title: "Проектирование",
      description:
        "Создание климатических решений для квартир, домов и коммерческих помещений.",
    },
  ];

  return (
    <section className="px-8 py-24 bg-slate-50">

      <div className="max-w-6xl">

        <p className="text-sm uppercase tracking-widest text-slate-500">
          Наши услуги
        </p>


        <h2 className="mt-4 text-4xl font-bold">
          Полный цикл климатических решений
        </h2>


        <div className="mt-12 grid md:grid-cols-2 gap-6">

          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl bg-white p-8 border"
            >

              <h3 className="text-2xl font-semibold">
                {service.title}
              </h3>


              <p className="mt-4 text-slate-600">
                {service.description}
              </p>


            </div>
          ))}

        </div>


      </div>

    </section>
  );
}