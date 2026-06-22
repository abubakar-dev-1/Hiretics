import type { APIGatewayProxyHandler } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { created, badRequest, conflict, serverError } from '../../lib/response';
import { getUserByEmail, createCandidateAccount, publicUser } from '../../models/user';
import { signToken } from '../../lib/jwt';

/**
 * POST /auth/candidate-signup  (public)
 * Creates a candidate account (the job-seeker side of the two-sided platform).
 * Returns a JWT for immediate login. Candidates are self-scoped (companyId = userId).
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { fullName, email, password } = JSON.parse(event.body || '{}');
    if (!fullName || !email || !password) {
      return badRequest('fullName, email and password are required');
    }
    if (password.length < 8) return badRequest('Password must be at least 8 characters');
    if (await getUserByEmail(email)) return conflict('An account with this email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createCandidateAccount({ fullName, email, passwordHash });

    const token = signToken({
      userId: user.userId,
      companyId: user.companyId,
      role: 'Candidate',
      email: user.email,
    });

    return created({ token, user: publicUser(user) });
  } catch (e: any) {
    return serverError(e?.message || 'candidate signup failed');
  }
};
