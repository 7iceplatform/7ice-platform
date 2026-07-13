import { Container } from "@/components/layout";

interface Value {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

const values: Value[] = [
  {
    title: "Надежность",
    description:
      "Мы работаем с проверенными производителями и предоставляем расширенную гарантию на все виды работ.",
    icon: "🛡️",
  },
  {
    title: "Прозрачность",
    description:
      "Честные цены без скрытых платежей. Детальная смета до начала работ. Контроль на каждом этапе.",
    icon: "🔍",
  },
  {
    title: "Экспертиза",
    description:
      "Более 500 выполненных проектов. Сертифицированные инженеры с опытом работы от 5 лет.",
    icon: "🏆",
  },
  {
    title: "Технологичность",
    description:
      "Цифровая платформа для управления климатическими системами. Мониторинг, автоматизация, аналитика.",
    icon: "💻",
  },
];

export function AboutValues() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Наши ценности
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Почему выбирают нас
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-card border border-border-subtle bg-brand-white p-6"
            >
              <span className="text-3xl">{value.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-brand-graphite">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-brand-graphite/60">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
