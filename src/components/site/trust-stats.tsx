"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { Building2, Package, ClipboardCheck } from "lucide-react";

const stats = [
  { icon: Building2, value: 350, suffix: "+", label: "empresas atendidas" },
  { icon: Package, value: 1200, suffix: "+", label: "produtos disponíveis" },
  { icon: ClipboardCheck, value: 4000, suffix: "+", label: "pedidos realizados" },
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
    <span ref={ref} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

export function TrustStats() {
  return (
    <section className="border-b border-border bg-background py-12">
      <div className="container-premium grid grid-cols-1 gap-8 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4">
            <stat.icon className="h-9 w-9 shrink-0 text-accent" />
            <div>
              <Counter value={stat.value} suffix={stat.suffix} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
