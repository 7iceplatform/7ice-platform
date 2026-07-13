"use client";

import { useState } from "react";

export default function Calculator() {
  const [step, setStep] = useState(1);

  const [object, setObject] = useState("");
  const [area, setArea] = useState("");

  const power = area ? Number(area) * 0.1 : 0;

  const objects = [
    "Квартира",
    "Частный дом",
    "Офис",
    "Коммерческое помещение",
  ];


  return (
    <section className="px-8 py-32 bg-[#0B0D10] text-white">

      <div className="max-w-4xl mx-auto">


        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Умный расчет 7ice
        </p>


        <h2 className="mt-6 text-5xl md:text-6xl font-semibold leading-tight">
          Подберем климатическое
          решение под ваш объект
        </h2>


        <p className="mt-6 text-xl text-slate-400">
          Ответьте на несколько вопросов.
          Мы рассчитаем необходимую мощность
          и подготовим предложение.
        </p>



        <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10">


          <div className="text-sm text-slate-400">
            Шаг {step} из 3
          </div>



          {step === 1 && (

            <div>

              <h3 className="mt-6 text-3xl font-semibold">
                Какой объект нужно оборудовать?
              </h3>


              <div className="mt-8 grid gap-4">


                {objects.map((item)=>(

                  <button
                    key={item}
                    onClick={()=>{
                      setObject(item);
                      setStep(2);
                    }}
                    className="
                    rounded-xl
                    border
                    border-white/20
                    px-6
                    py-5
                    text-left
                    hover:bg-white/10
                    transition
                    "
                  >
                    {item}
                  </button>

                ))}


              </div>

            </div>

          )}



          {step === 2 && (

            <div>

              <h3 className="mt-6 text-3xl font-semibold">
                Какая площадь помещения?
              </h3>


              <p className="mt-3 text-slate-400">
                Вы выбрали: {object}
              </p>


              <input

                type="number"

                value={area}

                onChange={(e)=>setArea(e.target.value)}

                placeholder="Например: 45"

                className="
                mt-8
                w-full
                rounded-xl
                bg-white/10
                border
                border-white/20
                px-6
                py-5
                text-white
                outline-none
                "

              />


              <button

                disabled={!area}

                onClick={()=>setStep(3)}

                className="
                mt-8
                rounded-full
                bg-white
                px-10
                py-4
                text-black
                font-semibold
                disabled:opacity-40
                "

              >
                Рассчитать

              </button>


            </div>

          )}



          {step === 3 && (

            <div>

              <h3 className="mt-6 text-3xl font-semibold">
                Предварительный расчет
              </h3>



              <div className="mt-8 space-y-4 text-lg">


                <p>
                  Объект:
                  <span className="ml-2 font-semibold">
                    {object}
                  </span>
                </p>



                <p>
                  Площадь:
                  <span className="ml-2 font-semibold">
                    {area} м²
                  </span>
                </p>



                <p>
                  Рекомендуемая мощность:

                  <span className="block mt-2 text-3xl font-bold">
                    {power.toFixed(1)} кВт
                  </span>

                </p>


              </div>



              <button

                className="
                mt-10
                rounded-full
                bg-white
                px-10
                py-4
                text-black
                font-semibold
                "

              >
                Получить предложение 7ice

              </button>


            </div>

          )}



        </div>


      </div>


    </section>
  );
}