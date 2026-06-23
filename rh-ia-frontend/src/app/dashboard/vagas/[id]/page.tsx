"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, FileText, UploadCloud } from "lucide-react";
import { api, ApiError, uploadResume } from "@/lib/api";
import {
  parseJobRequirements,
  type Job,
  type ScoredCandidate,
  type StructuredJobRequirements,
} from "@/lib/types";
import { Modal } from "@/components/Modal";
import { ScoreBadge, scoreColor } from "@/components/ScoreBadge";

interface UploadItem {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "analyzing" | "done" | "error";
  error?: string;
}

function slugifyName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "Candidato";
}

function placeholderEmail(fileName: string): string {
  const slug = fileName
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
  return `${slug || "candidato"}@curriculo.local`;
}

export default function VagaDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [selected, setSelected] = useState<ScoredCandidate | null>(null);

  const requirements: StructuredJobRequirements | null = useMemo(
    () => (job ? parseJobRequirements(job.description) : null),
    [job],
  );

  const loadJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setJob(await api.getJob(jobId));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Erro ao carregar a vaga");
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const handleFiles = useCallback(
    (files: File[]) => {
      files.forEach((file) => {
        const itemId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploads((prev) => [
          ...prev,
          { id: itemId, fileName: file.name, progress: 0, status: "uploading" },
        ]);

        uploadResume(
          jobId,
          file,
          { name: slugifyName(file.name), email: placeholderEmail(file.name) },
          (percent) => {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === itemId
                  ? { ...u, progress: percent, status: percent >= 100 ? "analyzing" : "uploading" }
                  : u,
              ),
            );
          },
        )
          .then((res) => {
            setCandidates((prev) =>
              [...prev, { candidate: res.candidate, analysis: res.aiAnalysis }].sort(
                (a, b) => (b.candidate.aiScore ?? 0) - (a.candidate.aiScore ?? 0),
              ),
            );
            setUploads((prev) =>
              prev.map((u) => (u.id === itemId ? { ...u, status: "done", progress: 100 } : u)),
            );
          })
          .catch((err: unknown) => {
            const message = err instanceof Error ? err.message : "Falha na análise";
            setUploads((prev) =>
              prev.map((u) => (u.id === itemId ? { ...u, status: "error", error: message } : u)),
            );
          });
      });
    },
    [jobId],
  );

  if (loading) return <p className="text-sm text-slate-500">Carregando vaga...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!job) return null;

  return (
    <div>
      <Link
        href="/dashboard/vagas"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para vagas
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-slate-900">{job.title}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna esquerda: descrição da vaga */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Descrição da vaga</h2>
          {requirements ? (
            <div className="space-y-5 text-sm">
              <Block title="Resumo">
                <p className="text-slate-600">{requirements.summary}</p>
              </Block>
              <ListBlock title="Responsabilidades" items={requirements.responsibilities} />
              <ListBlock title="Requisitos" items={requirements.requirements} />
              <ListBlock title="Diferenciais" items={requirements.niceToHave} />
            </div>
          ) : (
            <p className="text-sm text-slate-500">Descrição não disponível.</p>
          )}
        </section>

        {/* Coluna direita: candidatos */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Candidatos</h2>

          <Dropzone onFiles={handleFiles} />

          {uploads.filter((u) => u.status !== "done").length > 0 && (
            <div className="mt-4 space-y-2">
              {uploads
                .filter((u) => u.status !== "done")
                .map((u) => (
                  <UploadRow key={u.id} item={u} />
                ))}
            </div>
          )}

          <div className="mt-6">
            <RankingTable candidates={candidates} onView={setSelected} />
          </div>
        </section>
      </div>

      <CandidateEvalModal
        scored={selected}
        questions={requirements?.screeningQuestions ?? []}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function Dropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    onDrop: onFiles,
  });

  return (
    <div
      {...getRootProps()}
      data-tour="dropzone-area"
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
        isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mb-2 h-8 w-8 text-indigo-500" />
      <p className="text-sm font-medium text-slate-700">
        {isDragActive ? "Solte os currículos aqui" : "Arraste currículos em PDF ou clique para selecionar"}
      </p>
      <p className="mt-1 text-xs text-slate-400">Múltiplos arquivos são aceitos</p>
    </div>
  );
}

function UploadRow({ item }: { item: UploadItem }) {
  const label =
    item.status === "uploading"
      ? `Enviando... ${item.progress}%`
      : item.status === "analyzing"
        ? "Claude está analisando o currículo..."
        : item.status === "error"
          ? item.error ?? "Erro"
          : "Concluído";

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 truncate text-xs font-medium text-slate-600">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          {item.fileName}
        </span>
        <span className={`text-xs ${item.status === "error" ? "text-red-600" : "text-slate-500"}`}>{label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            item.status === "error"
              ? "bg-red-500"
              : item.status === "analyzing"
                ? "animate-pulse bg-indigo-400"
                : "bg-indigo-600"
          }`}
          style={{ width: `${item.status === "analyzing" ? 100 : item.progress}%` }}
        />
      </div>
    </div>
  );
}

function RankingTable({
  candidates,
  onView,
}: {
  candidates: ScoredCandidate[];
  onView: (c: ScoredCandidate) => void;
}) {
  if (candidates.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum candidato analisado ainda.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-2.5 font-medium">#</th>
            <th className="px-4 py-2.5 font-medium">Candidato</th>
            <th className="px-4 py-2.5 font-medium">Nota</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {candidates.map((sc, index) => (
            <tr key={sc.candidate.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-400">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{sc.candidate.name}</td>
              <td className="px-4 py-3">
                <ScoreBadge score={sc.candidate.aiScore ?? 0} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onView(sc)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Ver Avaliação
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CandidateEvalModal({
  scored,
  questions,
  onClose,
}: {
  scored: ScoredCandidate | null;
  questions: string[];
  onClose: () => void;
}) {
  if (!scored) return null;
  const score = scored.candidate.aiScore ?? 0;
  const c = scoreColor(score);

  return (
    <Modal open={!!scored} onClose={onClose} title={scored.candidate.name} variant="right">
      <div className="space-y-6">
        <div className={`flex items-center gap-3 rounded-lg p-4 ring-1 ${c.bg} ${c.ring}`}>
          <ScoreBadge score={score} />
          <div>
            <p className={`text-sm font-semibold ${c.text}`}>Nota de aderência: {score}/100</p>
            <p className="text-xs text-slate-500">{scored.candidate.email}</p>
          </div>
        </div>

        <Block title="Resumo da IA">
          <p className="text-sm text-slate-600">{scored.candidate.aiSummary ?? scored.analysis.aiSummary}</p>
        </Block>

        <Block title="Pontos fortes">
          <div className="flex flex-wrap gap-2">
            {scored.analysis.extractedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Perguntas personalizadas para a entrevista">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </Block>
      </div>
    </Modal>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <Block title={title}>
      <ul className="list-disc space-y-1 pl-5 text-slate-600">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </Block>
  );
}
