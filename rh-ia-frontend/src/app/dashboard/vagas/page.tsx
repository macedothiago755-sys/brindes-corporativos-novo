"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { parseJobRequirements, type Job, type StructuredJobRequirements } from "@/lib/types";
import { Modal } from "@/components/Modal";
import { AiLoader } from "@/components/AiLoader";
import { TOUR_OPEN_JOB_MODAL_EVENT } from "@/lib/onboarding";

export default function VagasPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJobs(await api.listJobs());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    function openFromTour() {
      setModalOpen(true);
    }
    window.addEventListener(TOUR_OPEN_JOB_MODAL_EVENT, openFromTour);
    return () => window.removeEventListener(TOUR_OPEN_JOB_MODAL_EVENT, openFromTour);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vagas</h1>
          <p className="text-sm text-slate-500">Crie vagas estruturadas por IA e faça a triagem de candidatos.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Nova Vaga
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Carregando vagas...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500">Nenhuma vaga ainda. Crie a primeira com a ajuda da IA.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => {
          const req = parseJobRequirements(job.description);
          return (
            <Link
              key={job.id}
              href={`/dashboard/vagas/${job.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{job.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{job.status}</span>
              </div>
              <p className="line-clamp-3 text-sm text-slate-500">{req?.summary ?? "—"}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
                Ver triagem
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <CreateJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(job) => {
          setJobs((prev) => [job, ...prev]);
        }}
      />
    </div>
  );
}

function CreateJobModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (job: Job) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [draft, setDraft] = useState<StructuredJobRequirements | null>(null);

  function reset() {
    setTitle("");
    setGenerating(false);
    setError(null);
    setCreatedJob(null);
    setDraft(null);
  }

  async function handleGenerate() {
    if (title.trim().length < 2) {
      setError("Informe um título de vaga.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      // O backend usa o título também como base textual para a IA estruturar.
      const result = await api.createJob(title, `Vaga de ${title} — estruture os requisitos.`);
      setCreatedJob(result.job);
      setDraft(result.aiStructuredRequirements);
      onCreated(result.job);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Erro ao gerar a vaga");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Nova Vaga"
    >
      {generating ? (
        <AiLoader />
      ) : draft && createdJob ? (
        <div className="space-y-4">
          <p className="text-sm text-emerald-600">✓ Vaga estruturada pela IA. Revise e ajuste se necessário.</p>
          <EditableField
            label="Resumo"
            value={draft.summary}
            onChange={(v) => setDraft({ ...draft, summary: v })}
          />
          <EditableListField
            label="Responsabilidades"
            items={draft.responsibilities}
            onChange={(items) => setDraft({ ...draft, responsibilities: items })}
          />
          <EditableListField
            label="Requisitos"
            items={draft.requirements}
            onChange={(items) => setDraft({ ...draft, requirements: items })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Link
              href={`/dashboard/vagas/${createdJob.id}`}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Abrir triagem
            </Link>
          </div>
        </div>
      ) : (
        <div data-tour="generate-job-button" className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Título da Vaga</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Analista de Suporte"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Sparkles className="h-4 w-4" />
            Gerar com IA
          </button>
        </div>
      )}
    </Modal>
  );
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );
}

function EditableListField({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").filter(Boolean))}
        rows={Math.max(3, items.length)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );
}
