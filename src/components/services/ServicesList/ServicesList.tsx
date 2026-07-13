import { Container } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

interface Service {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly features: string[];
  readonly price: string;
  readonly icon: string;
}

const services: Service[] = [
  {
    code: "project",
    title: "Проектирование",
    description:
      "Разработка проекта климатической системы с учётом особенностей помещения, тепловых нагрузок и требований к комфорту.",
    features: [
      "Выезд замерщика",
      "Тепловой расчёт",
      "3D-проект вентиляции",
      "Сметная документация",
    ],
    price: "от 5 000 ₽",
    icon: "📐",
  },
  {
    code: "installation",
    title: "Монтаж",
    description:
      "Профессиональная установка кондиционеров, вентиляции и VRF-систем с гарантией на работы.",
    features: [
      "Монтаж за 1 день",
      "Сертифицированные специалисты",
      "Гарантия на монтаж",
      "Уборка после работ",
    ],
    price: "от 8 000 ₽",
    icon: "🔧",
  },
  {
    code: "service",
    title: "Обслуживание",
    description:
      "Регулярное техническое обслуживание для поддержания эффективности и продления срока службы оборудования.",
    features: [
      "Чистка фильтров",
      "Проверка хладагента",
      "Диагностика электрики",
      "Профилактика поломок",
    ],
    price: "от 2 500 ₽",
    icon: "🛠️",
  },
  {
    code: "repair",
    title: "Ремонт",
    description:
      "Диагностика и устранение неисправностей любых климатических систем с выездом на объект.",
    features: [
      "Диагностика бесплатно",
      "Оригинальные запчасти",
      "Гарантия на ремонт",
      "Выезд в день обращения",
    ],
    price: "от 3 000 ₽",
    icon: "⚡",
  },
  {
    code: "warranty",
    title: "Гарантия",
    description:
      "Расширенная гарантия на оборудование и выполненные работы для вашей безопасности.",
    features: [
      "До 5 лет на оборудование",
      "До 3 лет на монтаж",
      "Бесплатный выезд по гарантии",
      "Замена оборудования",
    ],
    price: "Включено",
    icon: "🛡️",
  },
  {
    code: "emergency",
    title: "Экстренный вызов",
    description:
      "Срочный выезд специалиста для устранения критических неисправностей в кратчайшие сроки.",
    features: [
      "Выезд за 2 часа",
      "Круглосуточно",
      "Приоритетное обслуживание",
      "Диагностика на месте",
    ],
    price: "от 5 000 ₽",
    icon: "🚨",
  },
];

export function ServicesList() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Что мы делаем
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Наши услуги
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.code}
              className={cn(
                "flex flex-col rounded-card border border-border-subtle bg-brand-white p-6 transition-all duration-200",
                "hover:border-brand-blue hover:shadow-sm",
              )}
            >
              <span className="text-3xl">{service.icon}</span>

              <h3 className="mt-4 text-lg font-semibold text-brand-graphite">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-brand-graphite/60">
                {service.description}
              </p>

              <ul className="mt-4 flex-1 space-y-2">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-brand-graphite/70"
                  >
                    <span className="text-brand-blue">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-border-subtle pt-4">
                <span className="text-base font-bold text-brand-graphite">
                  {service.price}
                </span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
