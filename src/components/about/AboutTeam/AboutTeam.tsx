import { Container } from "@/components/layout";

interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly description: string;
}

const team: TeamMember[] = [
  {
    name: "Алексей Петров",
    role: "Генеральный директор",
    description:
      "Более 15 лет опыта в HVAC-индустрии. Руководит стратегией развития компании.",
  },
  {
    name: "Мария Козлова",
    role: "Технический директор",
    description:
      "Инженер-проектировщик с опытом создания сложных климатических систем для коммерческих объектов.",
  },
  {
    name: "Дмитрий Волков",
    role: "Руководитель монтажа",
    description:
      "Курирует все монтажные работы. Контролирует качество и сроки на каждом проекте.",
  },
  {
    name: "Елена Сидорова",
    role: "Руководитель сервиса",
    description:
      "Управляет сервисной службой. Обеспечивает оперативное обслуживание и ремонт.",
  },
];

export function AboutTeam() {
  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Наша команда
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Люди, которые делают климат
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <article
              key={member.name}
              className="rounded-card border border-border-subtle bg-brand-white p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue text-xl font-bold text-brand-white">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-brand-graphite">
                {member.name}
              </h3>

              <span className="text-xs font-medium text-brand-blue">
                {member.role}
              </span>

              <p className="mt-3 text-sm leading-6 text-brand-graphite/60">
                {member.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
