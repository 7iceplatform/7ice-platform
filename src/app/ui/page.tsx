import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout";

export default function UIPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Container size="wide">
        <Section spacing="lg">
          <div className="space-y-12">
            <header>
              <h1 className="text-5xl font-bold">7ice UI Kit</h1>

              <p className="mt-3 text-slate-400">
                Внутренняя страница для проверки компонентов платформы.
              </p>
            </header>

            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">
                Buttons
              </h2>

              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>

                <Button variant="secondary">
                  Secondary
                </Button>

                <Button variant="dark">
                  Dark
                </Button>

                <Button variant="ghost">
                  Ghost
                </Button>

                <Button variant="text">
                  Text
                </Button>
              </div>
            </section>
            <section className="space-y-6">
  <h2 className="text-2xl font-semibold">
    Colors
  </h2>

  <div className="flex flex-wrap gap-6">

    <div className="space-y-2">
      <div className="h-20 w-20 rounded-xl bg-brand-blue" />
      <p className="text-sm">Brand Blue</p>
    </div>

    <div className="space-y-2">
      <div className="h-20 w-20 rounded-xl bg-brand-graphite" />
      <p className="text-sm">Graphite</p>
    </div>

    <div className="space-y-2">
      <div className="h-20 w-20 rounded-xl border border-white/10 bg-white" />
      <p className="text-sm text-white">White</p>
    </div>


  </div>

  <section className="space-y-6">
  <h2 className="text-2xl font-semibold">
    Typography
  </h2>

  <div className="space-y-4">

    <h1 className="text-6xl font-bold">
      Heading 1
    </h1>

    <h2 className="text-4xl font-semibold">
      Heading 2
    </h2>

    <p className="text-lg text-slate-300">
      Это пример основного текста, который будет использоваться
      на сайте 7ice.
    </p>

  </div>
</section>
</section>
          </div>
        </Section>
      </Container>
    </main>
  );
}