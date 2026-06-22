import type { APIGatewayProxyHandler } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { created, badRequest, conflict, forbidden, serverError } from '../../lib/response';
import { getUserByEmail, createUser, publicUser } from '../../models/user';
import { createCompany } from '../../models/company';
import { signToken } from '../../lib/jwt';

/**
 * POST /admin/bootstrap  (secret-gated, public route)
 * One-time creation of the platform owner (SuperAdmin). Protected by
 * PLATFORM_BOOTSTRAP_SECRET so it can't be abused. The owner lives in a dedicated
 * "Hiretics Platform" company so the JWT shape stays uniform.
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { secret, fullName, email, password } = JSON.parse(event.body || '{}');
    const expected = process.env.PLATFORM_BOOTSTRAP_SECRET;
    if (!expected) return serverError('Bootstrap secret not configured');
    if (secret !== expected) return forbidden('Invalid bootstrap secret');
    if (!fullName || !email || !password) {
      return badRequest('fullName, email and password are required');
    }
    if (password.length < 8) return badRequest('Password must be at least 8 characters');
    if (await getUserByEmail(email)) return conflict('An account with this email already exists');

    const company = await createCompany('Hiretics Platform', 0);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      companyId: company.companyId,
      fullName,
      email,
      passwordHash,
      role: 'SuperAdmin',
    });

    const token = signToken({
      userId: user.userId,
      companyId: company.companyId,
      role: 'SuperAdmin',
      email: user.email,
    });

    return created({ token, user: publicUser(user) });
  } catch (e: any) {
    return serverError(e?.message || 'bootstrap failed');
  }
};
