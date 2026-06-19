"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { Building2, Package, ClipboardCheck } from "lucide-react";

const stats = [
  { icon: Building2, value: 350, suffix: "+", label: "Empresas atendidas", color: "var(--brand-purple)" },
  { icon: Package, value: 1200, suffix: "+", label: "Produtos personalizados", color: "var(--brand-magenta)" },
  { icon: ClipboardCheck, value: 4000, suffix: "+", label: "Projetos entregues", color: "var(--brand-blue)" },
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
      <div className="container-premium grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${stat.color}1a`, color: stat.color }}
            >
              <stat.icon className="h-6 w-6" />
            </div>
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
