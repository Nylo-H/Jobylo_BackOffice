/**
 * Type-safe wrapper for axios errors.
 * Usage: `const err = toApiError(unknownErr); err.message ...`
 */
export interface ApiErrorShape {
  message: string;
  status: number;
  data: unknown;
  code?: string;
}

export function toApiError(err: unknown): ApiErrorShape {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const e = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
      code?: string;
    };
    const data = e.response?.data as { error?: string; message?: string } | undefined;
    return {
      message: data?.error ?? data?.message ?? e.message ?? 'Erreur réseau',
      status: e.response?.status ?? 0,
      data: e.response?.data,
      code: e.code,
    };
  }
  if (err instanceof Error) {
    return { message: err.message, status: 0, data: null };
  }
  return { message: 'Erreur inconnue', status: 0, data: null };
}

export function getApiErrorMessage(err: unknown, fallback = 'Erreur'): string {
  return toApiError(err).message || fallback;
}
