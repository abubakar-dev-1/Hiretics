import type { APIGatewayProxyHandler } from 'aws-lambda';
import bcrypt from 'bcryptjs';
import { ok, badRequest, unauthorized, serverError } from '../../lib/response';
import { getUserByEmail, publicUser } from '../../models/user';
import { signToken } from '../../lib/jwt';

/** POST /auth/signin (public) — verify password, return a JWT. */
export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) return badRequest('email and password are required');

    const user = await getUserByEmail(email);
    // Same message whether the email or password is wrong (no user enumeration).
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return unauthorized('Invalid email or password');
    }

    const token = signToken({
      userId: user.userId,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
    });
    return ok({ token, user: publicUser(user) });
  } catch (e: any) {
    return serverError(e?.message || 'signin failed');
  }
};
