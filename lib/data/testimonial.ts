export interface Testimonial {
  id: number;
  name: string;
  title: string;
  quote: string;
  image: string;
}

// Testimonial data
export const testimonials = [
  {
    id: 1,
    name: "Jennifer Cooper",
    title: "Startup Founder, TechFlow",
    quote:
      "SkillKwiz has transformed our hiring process. We've reduced our time-to-hire by 40% and improved candidate quality significantly. The detailed skill reports give us confidence in every hiring decision.",
    image: "/images/homepage/5.png",
  },
  {
    id: 2,
    name: "Michael Donovan",
    title: "HR Director, Global Systems",
    quote:
      "As an enterprise with hundreds of technical hires annually, SkillKwiz has been invaluable. Their comprehensive skill assessments and secure testing environment ensure we get accurate insights into candidate capabilities.",
    image: "/images/homepage/6.png",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    title: "Talent Acquisition, InnovateTech",
    quote:
      "The flexibility of SkillKwiz's platform is what sets it apart. We can customize assessments to our specific needs, and the detailed reports help us make data-driven hiring decisions every time.",
    image: "/images/homepage/6.png",
  },
  {
    id: 4,
    name: "David Chen",
    title: "CTO, FutureTech Solutions",
    quote:
      "The technical assessments from SkillKwiz have been spot-on. We're able to quickly identify candidates with the right skills, saving our engineering team countless hours of interview time.",
    image: "/images/homepage/5.png",
  },
  {
    id: 5,
    name: "Emily Rodriguez",
    title: "Recruiting Manager, Innovate Inc",
    quote:
      "SkillKwiz has become an essential part of our hiring toolkit. The platform is intuitive, the assessments are comprehensive, and the customer support is exceptional.",
    image: "/images/homepage/7.png",
  },
];