import { Container } from "@/components/layout";

interface Stat {
  readonly value: string;
  readonly label: string;
}

const stats: Stat[] = [
  { value: "500+", label: "Выполненных проектов" },
  { value: "8 лет", label: "На рынке" },
  { value: "98%", label: "Довольных клиентов" },
  { value: "24/7", label: "Поддержка" },
];

export function PortfolioStats() {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-brand-blue xl:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-brand-graphite/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
