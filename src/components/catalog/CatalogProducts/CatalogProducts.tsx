import { Container } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  readonly id: string;
  readonly name: string;
  readonly brand: string;
  readonly category: string;
  readonly price: number;
  readonly area: string;
  readonly features: string[];
  readonly isNew?: boolean;
}

const products: Product[] = [
  {
    id: "daikin-ftxm",
    name: "Daikin FTXM",
    brand: "Daikin",
    category: "Сплит-система",
    price: 89_900,
    area: "до 35 м²",
    features: ["Инвертор", "Тихий режим", "Wi-Fi управление"],
    isNew: true,
  },
  {
    id: "mitsubishi-electric-msz-gl",
    name: "Mitsubishi Electric MSZ-GL",
    brand: "Mitsubishi Electric",
    category: "Сплит-система",
    price: 62_400,
    area: "до 25 м²",
    features: ["Инвертор", "Энергоэффективность A++"],
  },
  {
    id: "hitani-ra-35",
    name: "Hitachi RA-35",
    brand: "Hitachi",
    category: "Сплит-система",
    price: 54_900,
    area: "до 30 м²",
    features: ["Инвертор", "Фильтрация воздуха"],
  },
  {
    id: "daikin-rvs",
    name: "Daikin RVS",
    brand: "Daikin",
    category: "VRF-система",
    price: 450_000,
    area: "от 100 м²",
    features: ["Централизованное управление", "Энергоэффективность"],
  },
  {
    id: "ballu-multi",
    name: "Ballu BSMI",
    brand: "Ballu",
    category: "Мультисплит",
    price: 124_900,
    area: "до 60 м²",
    features: ["2 внутренних блока", "Инвертор"],
  },
  {
    id: "zephyr-volta",
    name: "Zephyr Volta",
    brand: "Zephyr",
    category: "Вентиляция",
    price: 38_500,
    area: "до 40 м²",
    features: ["Рекуперация тепла", "Низкий уровень шума"],
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function CatalogProducts() {
  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              Популярные модели
            </span>
            <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
              Оборудование в наличии
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col rounded-card border border-border-subtle bg-brand-white transition-all duration-200 hover:border-brand-blue hover:shadow-sm"
            >
              <div className="flex items-start justify-between p-6 pb-0">
                <Badge tone="default">{product.category}</Badge>
                {product.isNew ? <Badge tone="info">Новинка</Badge> : null}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-medium text-brand-graphite/50">
                  {product.brand}
                </span>
                <h3 className="mt-1 text-lg font-semibold text-brand-graphite">
                  {product.name}
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs text-brand-graphite/70">
                    {product.area}
                  </span>
                  {product.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs text-brand-graphite/70"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6">
                  <div className="text-xl font-bold text-brand-graphite">
                    {formatPrice(product.price)}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button size="sm" fullWidth>
                      Заказать
                    </Button>
                    <Button size="sm" variant="secondary" fullWidth>
                      Подробнее
                    </Button>
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
