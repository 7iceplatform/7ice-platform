import { Container } from "@/components/layout";
import { cn } from "@/lib/utils/cn";

interface Category {
  readonly code: string;
  readonly label: string;
  readonly description: string;
  readonly icon: string;
}

const categories: Category[] = [
  {
    code: "split",
    label: "Сплит-системы",
    description: "Компактные настенные кондиционеры для квартир и офисов",
    icon: "❄️",
  },
  {
    code: "multi",
    label: "Мультисплит",
    description: "Один внешний блок — несколько внутренних",
    icon: "❄️",
  },
  {
    code: "vrf",
    label: "VRF-системы",
    description: "Промышленные системы кондиционирования",
    icon: "🏗️",
  },
  {
    code: "ventilation",
    label: "Вентиляция",
    description: "Приточные и вытяжные системы с рекуперацией",
    icon: "💨",
  },
  {
    code: "commercial",
    description: "Кассетные, канальные и напольно-потолочные решения",
    icon: "🏢",
    label: "Коммерческие",
  },
  {
    code: "accessories",
    label: "Аксессуары",
    description: "Пульты, кронштейны, фильтры и комплектующие",
    icon: "🔧",
  },
];

export function CatalogCategories() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Категории
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Выберите тип оборудования
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.code}
              type="button"
              className={cn(
                "group flex items-start gap-4 rounded-card border border-border-subtle bg-brand-white p-6 text-left transition-all duration-200",
                "hover:border-brand-blue hover:shadow-sm",
              )}
            >
              <span className="mt-1 text-2xl">{category.icon}</span>

              <div>
                <h3 className="text-base font-semibold text-brand-graphite group-hover:text-brand-blue">
                  {category.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-graphite/60">
                  {category.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
