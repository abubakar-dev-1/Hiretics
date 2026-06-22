import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAuthContext, type AuthContext } from './jwt';
import { unauthorized, forbidden } from './response';

export type AuthedHandler = (
  event: APIGatewayProxyEvent,
  ctx: AuthContext,
) => Promise<APIGatewayProxyResult>;

/** Wrap a handler so it only runs with a valid JWT; injects the auth context. */
export function authed(fn: AuthedHandler) {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const ctx = getAuthContext(event);
    if (!ctx) return unauthorized();
    return fn(event, ctx);
  };
}

/** Wrap a handler so it only runs for Admins (RBAC). */
export function adminOnly(fn: AuthedHandler) {
  return authed(async (event, ctx) =>
    ctx.role !== 'Admin' ? forbidden('Admin access required') : fn(event, ctx),
  );
}

/** Wrap a handler so it only runs for the platform owner (SuperAdmin). */
export function superAdminOnly(fn: AuthedHandler) {
  return authed(async (event, ctx) =>
    ctx.role !== 'SuperAdmin' ? forbidden('Platform owner access required') : fn(event, ctx),
  );
}

/** Wrap a handler so it only runs for candidate accounts (the two-sided side). */
export function candidateOnly(fn: AuthedHandler) {
  return authed(async (event, ctx) =>
    ctx.role !== 'Candidate' ? forbidden('Candidate account required') : fn(event, ctx),
  );
}
