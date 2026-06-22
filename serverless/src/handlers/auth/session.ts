import { ok, notFound } from '../../lib/response';
import { authed } from '../../lib/rbac';
import { getUser, publicUser } from '../../models/user';

/** GET /auth/session — validate the JWT and return the current user. */
export const handler = authed(async (_event, ctx) => {
  const user = await getUser(ctx.userId);
  if (!user) return notFound('User not found');
  return ok({ user: publicUser(user) });
});
