import { getToken } from "@/lib/auth";
import type {
  CreateJobResponse,
  Job,
  UploadResumeResponse,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = body?.error?.message ?? `Erro ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return body.data as T;
}

export const api = {
  baseUrl: API_URL,

  login(email: string, password: string): Promise<{ token: string; user: unknown }> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(input: {
    companyName: string;
    name: string;
    email: string;
    password: string;
  }): Promise<{ token: string; user: unknown }> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listJobs(): Promise<Job[]> {
    return request("/jobs");
  },

  getJob(id: string): Promise<Job> {
    return request(`/jobs/${id}`);
  },

  createJob(title: string, description: string): Promise<CreateJobResponse> {
    return request("/jobs", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },
};

/**
 * Upload de currículo com acompanhamento de progresso. Usa XHR porque o
 * `fetch` não expõe eventos de progresso de upload. Envia multipart com o
 * campo `resume` + `name`/`email` exigidos pelo backend.
 */
export function uploadResume(
  jobId: string,
  file: File,
  fields: { name: string; email: string },
  onProgress: (percent: number) => void,
): Promise<UploadResumeResponse> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("name", fields.name);
    formData.append("email", fields.email);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/jobs/${jobId}/resumes`);
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let parsed: { data?: UploadResumeResponse; error?: { message?: string } } = {};
      try {
        parsed = JSON.parse(xhr.responseText);
      } catch {
        /* resposta não-JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300 && parsed.data) {
        resolve(parsed.data);
      } else {
        reject(new ApiError(xhr.status, parsed.error?.message ?? `Erro ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new ApiError(0, "Falha de rede ao enviar o currículo"));
    xhr.send(formData);
  });
}
