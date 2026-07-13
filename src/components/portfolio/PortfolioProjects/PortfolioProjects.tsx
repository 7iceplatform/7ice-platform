import { Container } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface Project {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly area: string;
  readonly equipment: string;
  readonly description: string;
  readonly duration: string;
}

const projects: Project[] = [
  {
    id: "business-center-avion",
    title: "Бизнес-центр «Аврора»",
    category: "Коммерческий объект",
    area: "2 500 м²",
    equipment: "VRF-система Daikin VRV",
    description:
      "Полная климатизация офисного здания: 48 внутренних блоков, централизованное управление, интеграция с BMS.",
    duration: "14 дней",
  },
  {
    id: "residential-complex-solnechny",
    title: "ЖК «Солнечный»",
    category: "Жилой комплекс",
    area: "120 квартир",
    equipment: "Сплит-системы Mitsubishi Electric",
    description:
      "Установка кондиционеров в 120 квартирах новостройки. Единая конфигурация, гарантия на 5 лет.",
    duration: "30 дней",
  },
  {
    id: "restaurant-veranda",
    title: "Ресторан «Веранда»",
    category: "Общепит",
    area: "350 м²",
    equipment: "Кассетные блоки Daikin",
    description:
      "Система кондиционирования зала и кухни с учётом санитарных норм и требований к шуму.",
    duration: "5 дней",
  },
  {
    id: "warehouse-logistic",
    title: "Логистический центр",
    category: "Склад",
    area: "4 000 м²",
    equipment: "Канальные системы Carrier",
    description:
      "Система вентиляции и кондиционирования складского комплекса с контролем влажности.",
    duration: "21 день",
  },
  {
    id: "medical-center",
    title: "Медицинский центр",
    category: "Медицина",
    area: "800 м²",
    equipment: "VRF-система Mitsubishi Electric",
    description:
      "Климат-контроль для кабинетов и операционных с высокой точностью поддержания температуры.",
    duration: "10 дней",
  },
  {
    id: "fitness-club",
    title: "Фитнес-клуб «Пульс»",
    category: "Спорт",
    area: "1 200 м²",
    equipment: "Канальные системы Daikin",
    description:
      "Вентиляция и кондиционирование тренировочных залов, бассейна и раздевалок.",
    duration: "12 дней",
  },
];

export function PortfolioProjects() {
  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Примеры работ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Реализованные проекты
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className={cn(
                "group flex flex-col rounded-card border border-border-subtle bg-brand-white transition-all duration-200",
                "hover:border-brand-blue hover:shadow-sm",
              )}
            >
              <div className="flex items-start justify-between p-6 pb-0">
                <Badge>{project.category}</Badge>
                <span className="text-xs text-brand-graphite/50">
                  {project.duration}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-brand-graphite">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-brand-graphite/60">
                  {project.description}
                </p>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs text-brand-graphite/70">
                      {project.area}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs text-brand-graphite/70">
                      {project.equipment}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
