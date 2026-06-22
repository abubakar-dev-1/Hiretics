import type { APIGatewayProxyHandler } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { created, badRequest, conflict, serverError } from '../../lib/response';
import { getUserByEmail, createUser, publicUser } from '../../models/user';
import { createCompany } from '../../models/company';
import { signToken } from '../../lib/jwt';

/**
 * POST /auth/signup  (public)
 * Creates a new Company + its first User (Admin). Grants 10 free credits so the
 * pipeline works out of the box. Returns a JWT for immediate login.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { companyName, fullName, email, password } = JSON.parse(event.body || '{}');
    if (!fullName || !email || !password) {
      return badRequest('fullName, email and password are required');
    }
    if (password.length < 8) {
      return badRequest('Password must be at least 8 characters');
    }

    if (await getUserByEmail(email)) {
      return conflict('An account with this email already exists');
    }

    const company = await createCompany(companyName || `${fullName}'s Company`, 10);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      companyId: company.companyId,
      fullName,
      email,
      passwordHash,
      role: 'Admin',
    });

    const token = signToken({
      userId: user.userId,
      companyId: company.companyId,
      role: 'Admin',
      email: user.email,
    });

    return created({ token, user: publicUser(user), company });
  } catch (e: any) {
    return serverError(e?.message || 'signup failed');
  }
};
