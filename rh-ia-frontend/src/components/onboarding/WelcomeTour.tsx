"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ACTIONS, Joyride, STATUS, type EventData, type Step } from "react-joyride";
import confetti from "canvas-confetti";
import {
  TOUR_OPEN_JOB_MODAL_EVENT,
  getSavedTourStep,
  hasCompletedTour,
  markTourCompleted,
  setSavedTourStep,
} from "@/lib/onboarding";

interface TourStepConfig {
  target: string;
  content: string;
  placement?: Step["placement"];
  isLast?: boolean;
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    target: '[data-tour="dashboard-overview"]',
    content:
      "Bem-vindo ao RH IA! Este é o seu painel de controle. Aqui você acompanha suas vagas, limites do plano e o uso de IA em tempo real.",
    placement: "bottom",
  },
  {
    target: '[data-tour="nav-vagas"]',
    content:
      "Vamos começar? Clique aqui em 'Vagas Abertas' para criar o seu primeiro processo seletivo inteligente.",
    placement: "bottom",
  },
  {
    target: '[data-tour="generate-job-button"]',
    content:
      "Basta digitar o cargo (ex: Analista de Marketing) e clicar em 'Gerar com IA' para o Claude 3.5 Sonnet criar a descrição completa e os requisitos técnicos para você.",
    placement: "left",
  },
  {
    target: '[data-tour="dropzone-area"]',
    content:
      "Com a vaga criada, basta arrastar e soltar os arquivos em PDF dos candidatos aqui. Nossa IA vai ranqueá-los automaticamente por aderência em segundos.",
    placement: "top",
  },
  {
    target: '[data-tour="nav-knowledge"]',
    content:
      "Por fim, em 'Base de Conhecimento', você pode subir os manuais da sua empresa para que nosso assistente virtual responda às dúvidas dos seus funcionários de forma segura.",
    placement: "bottom",
    isLast: true,
  },
];

const joyrideStyles = {
  options: {
    primaryColor: "#4f46e5",
    textColor: "#1e293b",
    backgroundColor: "#ffffff",
    arrowColor: "#ffffff",
    overlayColor: "rgba(15, 23, 42, 0.55)",
    zIndex: 10000,
  },
  buttonNext: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: 500,
  },
  buttonBack: { color: "#64748b", fontSize: 14 },
  buttonSkip: { color: "#64748b", fontSize: 14 },
  tooltip: { borderRadius: 12 },
  tooltipContent: { padding: "12px 4px", fontSize: 14, lineHeight: 1.5 },
};

export function WelcomeTour() {
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (hasCompletedTour()) return;
    setStepIndex(Math.min(getSavedTourStep(), TOUR_STEPS.length - 1));
  }, []);

  useEffect(() => {
    if (stepIndex === null) return;
    const selector = TOUR_STEPS[stepIndex].target;

    function check() {
      setTargetReady(!!document.querySelector(selector));
    }

    check();
    observerRef.current?.disconnect();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [stepIndex, pathname]);

  const finishTour = useCallback((withCelebration: boolean) => {
    markTourCompleted();
    setStepIndex(null);
    setTargetReady(false);
    if (withCelebration) {
      setCelebrate(true);
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#4f46e5", "#818cf8", "#c7d2fe", "#22c55e"],
      });
    }
  }, []);

  const handleEvent = useCallback(
    (data: EventData) => {
      if (stepIndex === null) return;
      const { action, status } = data;

      if (status === STATUS.SKIPPED || action === ACTIONS.SKIP) {
        finishTour(false);
        return;
      }

      if (action === ACTIONS.NEXT) {
        if (TOUR_STEPS[stepIndex].isLast) {
          finishTour(true);
          return;
        }

        if (stepIndex === 1) {
          window.dispatchEvent(new CustomEvent(TOUR_OPEN_JOB_MODAL_EVENT));
        }

        const next = stepIndex + 1;
        setSavedTourStep(next);
        setTargetReady(false);
        setStepIndex(next);
      }
    },
    [stepIndex, finishTour],
  );

  if (celebrate) {
    return <CelebrationCard onClose={() => setCelebrate(false)} />;
  }

  if (stepIndex === null || !targetReady) return null;

  const step = TOUR_STEPS[stepIndex];

  return (
    <Joyride
      key={stepIndex}
      steps={[
        {
          target: step.target,
          content: step.content,
          placement: step.placement,
          skipBeacon: true,
          buttons: ["skip", "primary"],
          locale: { last: step.isLast ? "Concluir" : "Próximo", skip: "Pular" },
        },
      ]}
      run
      stepIndex={0}
      continuous={false}
      scrollToFirstStep
      locale={{ skip: "Pular" }}
      styles={joyrideStyles}
      onEvent={handleEvent}
    />
  );
}

function CelebrationCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        <p className="mb-2 text-3xl">🚀</p>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Você está pronto para revolucionar o seu RH! 🚀
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Explore as vagas, crie processos com IA e conte com a Base de Conhecimento sempre que precisar.
        </p>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Vamos lá!
        </button>
      </div>
    </div>
  );
}
