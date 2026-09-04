"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AuthenticateSkillsSection() {
  const [leftFront, setLeftFront] = useState<1 | 2>(1);
  const [rightFront, setRightFront] = useState<3 | 4>(3);

  // Automatically switch the left image
  useEffect(() => {
    const interval = setInterval(() => {
      setLeftFront((current) => (current === 1 ? 2 : 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Automatically switch the right image
  useEffect(() => {
    const interval = setInterval(() => {
      setRightFront((current) => (current === 3 ? 4 : 3));
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const textContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const textItem = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="overflow-x-clip bg-background py-14 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)_minmax(0,1fr)] lg:gap-12">

          {/* =====================================================
              LEFT IMAGES
          ====================================================== */}

          <div
            className="
              relative order-2 isolate h-[320px] w-full
              sm:h-[400px]
              md:h-[420px]
              lg:order-1 lg:h-[500px]
            "
          >
            {/* Image 1 */}
            <motion.div
              onMouseEnter={() => setLeftFront(1)}
              initial={{ opacity: 0, x: -40, rotate: -12 }}
              whileInView={{
                opacity: 1,
                x: 0,
                rotate: -12,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={{
                zIndex: leftFront === 1 ? 20 : 10,
                scale: leftFront === 1 ? 1 : 0.96,
              }}
              className="
                absolute left-0 top-0 h-[80%] w-[80%]
                -rotate-6 sm:-rotate-12
                md:hover:-rotate-6
                will-change-transform
              "
            >
              <Image
                src="/images/homepage/skills_1.png"
                alt="Professional working at night"
                width={350}
                height={500}
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 75vw"
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>

            {/* Image 2 */}
            <motion.div
              onMouseEnter={() => setLeftFront(2)}
              initial={{ opacity: 0, x: -30, y: 30, rotate: -6 }}
              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: -6,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={{
                zIndex: leftFront === 2 ? 20 : 10,
                scale: leftFront === 2 ? 1 : 0.96,
              }}
              className="
                absolute bottom-0 left-[10%] h-[80%] w-[80%]
                -rotate-3 sm:-rotate-6
                md:hover:rotate-0
                will-change-transform
              "
            >
              <Image
                src="/images/homepage/skills_2.png"
                alt="Professional in tech environment"
                width={350}
                height={500}
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 75vw"
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>
          </div>

          {/* =====================================================
              CENTER CONTENT
          ====================================================== */}

          <motion.div
            variants={textContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.35,
            }}
            className="order-1 text-center md:col-span-2 lg:order-2 lg:col-span-1"
          >
            {/* Eyebrow */}
            <motion.p
              variants={textItem}
              className="
                mb-3 text-sm font-semibold uppercase
                tracking-[0.18em] text-accent
              "
            >
              Verified expertise
            </motion.p>

            {/* Heading */}
            <motion.h2
              variants={textItem}
              className="
                mb-4 text-balance text-3xl font-bold
                tracking-tight text-primary-gradient
                sm:text-4xl
              "
            >
              Authenticate Skills,
              <br />
              Simplify Hiring
            </motion.h2>

            {/* Accent line */}
            <motion.div
              variants={textItem}
              className="mx-auto mb-5 h-1 w-16 origin-center rounded-full bg-primary-gradient"
            />

            {/* Description */}
            <motion.p
              variants={textItem}
              className="
                mx-auto max-w-md text-pretty
                leading-7 text-muted-foreground
              "
            >
              SkillKwiz ensures professionals are evaluated accurately in
              their chosen fields. Our secure testing centers provide
              authenticated skill assessments, giving you instant access to
              verified reports—eliminating the need for lengthy technical
              interviews.
            </motion.p>
          </motion.div>

          {/* =====================================================
              RIGHT IMAGES
          ====================================================== */}

          <div
            className="
              relative order-3 isolate h-[320px] w-full
              sm:h-[400px]
              md:h-[420px]
              lg:h-[500px]
            "
          >
            {/* Image 3 */}
            <motion.div
              onMouseEnter={() => setRightFront(3)}
              initial={{ opacity: 0, x: 40, rotate: 12 }}
              whileInView={{
                opacity: 1,
                x: 0,
                rotate: 12,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={{
                zIndex: rightFront === 3 ? 20 : 10,
                scale: rightFront === 3 ? 1 : 0.96,
              }}
              className="
                absolute right-0 top-0 h-[80%] w-[80%]
                rotate-6 sm:rotate-9
                md:hover:rotate-6
                will-change-transform
              "
            >
              <Image
                src="/images/homepage/skills_3.png"
                alt="Professional at workstation"
                width={350}
                height={500}
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 75vw"
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>

            {/* Image 4 */}
            <motion.div
              onMouseEnter={() => setRightFront(4)}
              initial={{ opacity: 0, x: 30, y: 30, rotate: 6 }}
              whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 6,
              }}
              viewport={{
                once: true,
                amount: 0.25,
              }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={{
                zIndex: rightFront === 4 ? 20 : 10,
                scale: rightFront === 4 ? 1 : 0.96,
              }}
              className="
                absolute bottom-0 right-[10%] h-[80%] w-[80%]
                rotate-3 sm:rotate-6
                md:hover:rotate-0
                will-change-transform
              "
            >
              <Image
                src="/images/homepage/skills_4.png"
                alt="Business professional looking at digital interface"
                width={350}
                height={500}
                sizes="(min-width: 1024px) 28vw, (min-width: 768px) 38vw, 75vw"
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}