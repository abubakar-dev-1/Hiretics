import { adminOnly } from '../../lib/rbac';
import { ok, badRequest, notFound, forbidden, serverError } from '../../lib/response';
import { getUser, deleteUser } from '../../models/user';

/** DELETE /recruiters/{id} (Admin) — remove a user from the company. */
export const handler = adminOnly(async (event, ctx) => {
  try {
    const id = event.pathParameters?.id;
    if (!id) return badRequest('user id required');
    if (id === ctx.userId) return forbidden('You cannot remove yourself');

    const user = await getUser(id);
    if (!user || user.companyId !== ctx.companyId) return notFound('User not found');

    await deleteUser(id);
    return ok({ message: 'Recruiter removed' });
  } catch (e: any) {
    return serverError(e?.message || 'failed to remove recruiter');
  }
});
