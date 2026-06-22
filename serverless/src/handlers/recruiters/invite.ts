import bcrypt from 'bcryptjs';
import { adminOnly } from '../../lib/rbac';
import { created, badRequest, conflict, serverError } from '../../lib/response';
import { getUserByEmail, createUser, publicUser } from '../../models/user';

/** POST /recruiters (Admin) — add a user to the company (default role Recruiter). */
export const handler = adminOnly(async (event, ctx) => {
  try {
    const { fullName, email, password, role } = JSON.parse(event.body || '{}');
    if (!fullName || !email || !password) {
      return badRequest('fullName, email and password are required');
    }
    if (await getUserByEmail(email)) {
      return conflict('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      companyId: ctx.companyId,
      fullName,
      email,
      passwordHash,
      role: role === 'Admin' ? 'Admin' : 'Recruiter',
    });
    return created(publicUser(user));
  } catch (e: any) {
    return serverError(e?.message || 'failed to add recruiter');
  }
});
