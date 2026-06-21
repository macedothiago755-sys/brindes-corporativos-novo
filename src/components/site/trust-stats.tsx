"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

const stats = [
  { value: 350, suffix: "+", label: "empresas atendidas" },
  { value: 4000, suffix: "+", label: "projetos entregues" },
  { value: 1200, suffix: "+", label: "produtos personalizados" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1.2, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => setDisplay(Math.round(latest)));
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className="font-semibold text-foreground">
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

export function TrustStats() {
  return (
    <section className="border-b border-border bg-background py-3.5">
      <div className="container-premium flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-center text-xs sm:text-sm">
        {stats.map((stat, i) => (
          <span key={stat.label} className="flex items-center gap-2.5">
            <span className="text-muted-foreground">
              <Counter value={stat.value} suffix={stat.suffix} /> {stat.label}
            </span>
            {i < stats.length - 1 && <span className="text-border" aria-hidden="true">|</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
