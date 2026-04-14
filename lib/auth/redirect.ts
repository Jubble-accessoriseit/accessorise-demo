const DEFAULT_AUTH_REDIRECT = "/garage";

export function sanitizeAuthRedirect(nextPath: string | null | undefined): string {
  if (!nextPath) {
    return DEFAULT_AUTH_REDIRECT;
  }

  const trimmed = nextPath.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return trimmed;
}

export function buildLoginHref(options?: {
  next?: string | null;
  mode?: "login" | "signup";
}) {
  const params = new URLSearchParams();
  const next = sanitizeAuthRedirect(options?.next);

  if (next !== DEFAULT_AUTH_REDIRECT) {
    params.set("next", next);
  }

  if (options?.mode) {
    params.set("mode", options.mode);
  }

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

export { DEFAULT_AUTH_REDIRECT };
