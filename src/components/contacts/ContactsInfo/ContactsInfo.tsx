import { Container } from "@/components/layout";

interface ContactItem {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
  readonly icon: string;
}

const contacts: ContactItem[] = [
  {
    label: "Телефон",
    value: "+7 (495) 000-00-00",
    href: "tel:+74950000000",
    icon: "📞",
  },
  {
    label: "Email",
    value: "info@7ice.pro",
    href: "mailto:info@7ice.pro",
    icon: "✉️",
  },
  {
    label: "Адрес",
    value: "Москва, ул. Примерная, д. 1",
    icon: "📍",
  },
  {
    label: "Время работы",
    value: "Пн–Пт: 9:00–18:00",
    icon: "🕐",
  },
];

const socials = [
  { label: "Telegram", href: "#" },
  { label: "WhatsApp", href: "#" },
  { label: "VK", href: "#" },
];

export function ContactsInfo() {
  return (
    <section className="bg-white py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-blue">
              Контактная информация
            </span>
            <h2 className="mt-3 text-3xl font-bold text-brand-graphite xl:text-4xl">
              Свяжитесь с нами
            </h2>

            <div className="mt-8 space-y-6">
              {contacts.map((contact) => (
                <div key={contact.label} className="flex items-start gap-4">
                  <span className="mt-0.5 text-xl">{contact.icon}</span>
                  <div>
                    <div className="text-xs font-medium text-brand-graphite/50">
                      {contact.label}
                    </div>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        className="mt-1 block text-base font-semibold text-brand-graphite hover:text-brand-blue"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <div className="mt-1 text-base font-semibold text-brand-graphite">
                        {contact.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="text-xs font-medium text-brand-graphite/50">
                Социальные сети
              </div>
              <div className="mt-3 flex gap-4">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-sm font-medium text-brand-blue hover:opacity-80"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-card border border-border-subtle bg-surface-muted p-8">
            <h3 className="text-lg font-semibold text-brand-graphite">
              Мы на карте
            </h3>
            <div className="mt-4 flex h-[300px] items-center justify-center rounded-card bg-brand-white text-sm text-brand-graphite/50">
              Карта загружается...
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
