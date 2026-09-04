"use client";

import AuthenticateSkillsSection from "@/components/authenticate-skills-section";
import WhyChooseSection from "@/components/why-choose-section";
import LoginSection from "@/components/login-section";
import TestimonialsSection from "@/components/testimonials-section";
import LetterCarousel from "@/components/letter-carousel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Full-screen Hero Carousel */}
      <section className="relative w-full h-screen min-h-[650px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LetterCarousel />
        </div>
      </section>

      {/* Rest of the content */}
      <div className="bg-white relative z-10">
        <AuthenticateSkillsSection />
        <WhyChooseSection />
        <TestimonialsSection />
        <LoginSection />
      </div>
    </div>
  );
}