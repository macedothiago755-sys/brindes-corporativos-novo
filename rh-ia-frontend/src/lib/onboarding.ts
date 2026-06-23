const TOUR_DONE_KEY = "rh_ia_tour_done";
const TOUR_STEP_KEY = "rh_ia_tour_step";

/** Disparado pelo WelcomeTour para que a página de Vagas abra o modal "Nova Vaga" durante o tour. */
export const TOUR_OPEN_JOB_MODAL_EVENT = "rh-ia-tour:open-job-modal";

export function hasCompletedTour(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(TOUR_DONE_KEY) === "true";
}

export function markTourCompleted(): void {
  window.localStorage.setItem(TOUR_DONE_KEY, "true");
  window.localStorage.removeItem(TOUR_STEP_KEY);
}

export function getSavedTourStep(): number {
  const saved = window.localStorage.getItem(TOUR_STEP_KEY);
  const parsed = saved ? Number(saved) : 0;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function setSavedTourStep(step: number): void {
  window.localStorage.setItem(TOUR_STEP_KEY, String(step));
}
