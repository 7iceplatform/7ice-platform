import { Container } from "@/components/layout";

interface Step {
  readonly number: string;
  readonly title: string;
  readonly description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Заявка",
    description:
      "Оставьте заявку на сайте или позвоните нам. Мы зададим уточняющие вопросы и подберем удобное время для выезда.",
  },
  {
    number: "02",
    title: "Замер и проектирование",
    description:
      "Инженер выедет на объект, проведет замеры и разработает проект с учётом всех требований.",
  },
  {
    number: "03",
    title: "Согласование и смета",
    description:
      "Вы получите детальную смету с указанием стоимости оборудования и работ. Без скрытых платежей.",
  },
  {
    number: "04",
    title: "Монтаж",
    description:
      "Сертифицированные специалисты проведут установку в согласованные сроки. Монтаж занимает от 1 дня.",
  },
  {
    number: "05",
    title: "Сдача и гарантия",
    description:
      "Проверяем работу системы, обучаем вас пользоваться оборудованием и предоставляем гарантию.",
  },
];

export function ServicesProcess() {
  return (
    <section className="bg-surface-muted py-20">
      <Container>
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
            Как мы работаем
          </span>
          <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
            Этапы сотрудничества
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[23px] top-0 hidden h-full w-px bg-border-subtle xl:block" />

          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-6 xl:gap-10"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-brand-white xl:h-12 xl:w-12">
                  {step.number}
                </div>

                <div className="flex-1 rounded-card border border-border-subtle bg-brand-white p-6">
                  <h3 className="text-lg font-semibold text-brand-graphite">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-graphite/60">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
