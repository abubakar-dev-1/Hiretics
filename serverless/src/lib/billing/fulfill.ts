import { getTransaction, markPaid } from '../../models/transaction';
import { addCredits, setPlan } from '../../models/company';

/**
 * Apply the effect of a paid transaction exactly once (idempotent).
 * `markPaid` is a conditional update that transitions pending -> paid only on the
 * first call, so credits/Pro are never granted twice on webhook retries.
 */
export async function fulfillTransaction(
  txnId: string,
): Promise<{ fulfilled: boolean; reason?: string }> {
  const txn = await getTransaction(txnId);
  if (!txn) return { fulfilled: false, reason: 'transaction not found' };

  const transitioned = await markPaid(txnId);
  if (!transitioned) return { fulfilled: false, reason: 'already fulfilled' };

  if (txn.kind === 'credits') {
    await addCredits(txn.companyId, txn.credits ?? 0);
  } else if (txn.kind === 'pro') {
    await setPlan(txn.companyId, 'pro');
  }
  return { fulfilled: true };
}
