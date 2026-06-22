// Serverless auth (custom JWT). Replaces Supabase auth.
const SERVERLESS_API = process.env.NEXT_PUBLIC_SERVERLESS_API || "";

export interface AuthUser {
  userId: string;
  companyId: string;
  fullName: string;
  email: string;
  role: string;
  // back-compat aliases for existing components/api:
  id?: string;
  displayName?: string;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/** Authorization header for API calls (empty if not logged in). */
export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function persist(token: string, user: AuthUser) {
  localStorage.setItem("token", token);
  // augment with id/displayName aliases so existing components keep working
  localStorage.setItem(
    "user",
    JSON.stringify({ ...user, id: user.userId, displayName: user.fullName }),
  );
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const e = await res.json();
    return e.error || fallback;
  } catch {
    return fallback;
  }
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${SERVERLESS_API}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await readError(res, "Invalid email or password"));
  const data = await res.json();
  persist(data.token, data.user);
  return data;
}

export async function signUp(input: {
  companyName?: string;
  fullName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${SERVERLESS_API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to create account"));
  const data = await res.json();
  persist(data.token, data.user);
  return data;
}

export async function signUpCandidate(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${SERVERLESS_API}/auth/candidate-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readError(res, "Failed to create account"));
  const data = await res.json();
  persist(data.token, data.user);
  return data;
}

export function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
