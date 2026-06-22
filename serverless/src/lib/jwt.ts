import jwt from 'jsonwebtoken';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const SECRET = process.env.JWT_SECRET || 'dev-secret';

export type Role = 'SuperAdmin' | 'Admin' | 'Recruiter' | 'Candidate';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: Role;
  email: string;
}

export function signToken(ctx: AuthContext): string {
  return jwt.sign(ctx, SECRET, { expiresIn: '7d' });
}

/** Extract + verify the Bearer token from the request. Returns null if absent/invalid. */
export function getAuthContext(event: APIGatewayProxyEvent): AuthContext | null {
  const header = event.headers?.Authorization || event.headers?.authorization;
  if (!header) return null;
  const token = header.replace(/^Bearer\s+/i, '');
  try {
    const d = jwt.verify(token, SECRET) as Partial<AuthContext>;
    if (!d.userId || !d.companyId || !d.role) return null;
    return { userId: d.userId, companyId: d.companyId, role: d.role, email: d.email || '' };
  } catch {
    return null;
  }
}
