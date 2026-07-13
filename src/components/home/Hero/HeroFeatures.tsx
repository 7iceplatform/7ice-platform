const features = [
  "Гарантия на монтаж",
  "Сертифицированные специалисты",
  "Монтаж за 1 день",
  "Сервис 24/7",
];

export function HeroFeatures() {
  return (
    <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {features.map((feature) => (
        <div
          key={feature}
          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/90 backdrop-blur-sm"
        >
          {feature}
        </div>
      ))}
    </div>
  );
}