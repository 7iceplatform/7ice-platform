import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Advantages from "@/components/sections/Advantages";
import Calculator from "@/components/sections/Calculator";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Advantages />
      <Calculator />
      <Footer />
    </>
  );
}