"use client";

import { useState } from "react";

const propertyTypes = [
  { id: "apartment", icon: "🏠", label: "Квартира" },
  { id: "house", icon: "🏡", label: "Частный дом" },
  { id: "office", icon: "🏢", label: "Офис" },
] as const;

type PropertyType = (typeof propertyTypes)[number]["id"];

const areaOptions = [
  { id: "small", label: "До 50 м²" },
  { id: "medium", label: "50–100 м²" },
  { id: "large", label: "100–200 м²" },
  { id: "xlarge", label: "Свыше 200 м²" },
] as const;

const purposeOptions = [
  { id: "comfort", label: "Комфорт" },
  { id: "efficiency", label: "Экономия" },
  { id: "precision", label: "Точный контроль" },
] as const;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i < current ? "bg-blue-500" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function Step1({
  selected,
  onSelect,
}: {
  selected: PropertyType | null;
  onSelect: (id: PropertyType) => void;
}) {
  return (
    <>
      <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
        Шаг 1 из 3
      </span>

      <h3 className="mt-4 text-2xl font-bold text-white">
        Что подбираем?
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/60">
        Выберите тип объекта
      </p>

      <div className="mt-6 space-y-3">
        {propertyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`group flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
              selected === type.id
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-white/10 bg-white/5 text-white hover:border-blue-500/40 hover:bg-blue-500/10"
            }`}
          >
            <span className="text-xl">{type.icon}</span>
            <span className="font-medium">{type.label}</span>
            {selected === type.id && (
              <svg className="ml-auto h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function Step2({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
        Шаг 2 из 3
      </span>

      <h3 className="mt-4 text-2xl font-bold text-white">
        Площадь помещения?
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/60">
        Выберите подходящий диапазон
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {areaOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`rounded-xl border px-4 py-4 text-center text-sm font-medium transition-all ${
              selected === option.id
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:border-blue-500/40 hover:bg-blue-500/10"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

function Step3({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
        Шаг 3 из 3
      </span>

      <h3 className="mt-4 text-2xl font-bold text-white">
        Что важнее?
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/60">
        Приоритет при выборе оборудования
      </p>

      <div className="mt-6 space-y-3">
        {purposeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all ${
              selected === option.id
                ? "border-blue-500 bg-blue-500/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:border-blue-500/40 hover:bg-blue-500/10"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

export function HeroCalculator() {
  const [step, setStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<PropertyType | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  const isStep1Ready = selectedProperty !== null;
  const isStep2Ready = selectedArea !== null;
  const isStep3Ready = selectedPurpose !== null;

  function handleNext() {
    if (step === 1 && isStep1Ready) {
      setStep(2);
    } else if (step === 2 && isStep2Ready) {
      setStep(3);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  const canProceed =
    (step === 1 && isStep1Ready) ||
    (step === 2 && isStep2Ready) ||
    (step === 3 && isStep3Ready);

  return (
    <aside className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

      <StepIndicator current={step} total={3} />

      <div className="mt-6">
        {step === 1 && (
          <Step1
            selected={selectedProperty}
            onSelect={setSelectedProperty}
          />
        )}
        {step === 2 && (
          <Step2
            selected={selectedArea}
            onSelect={setSelectedArea}
          />
        )}
        {step === 3 && (
          <Step3
            selected={selectedPurpose}
            onSelect={setSelectedPurpose}
          />
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
          >
            Назад
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Далее
          </button>
        ) : (
          <button
            disabled={!canProceed}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Получить расчет
          </button>
        )}
      </div>

    </aside>
  );
}
