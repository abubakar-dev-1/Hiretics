// Run async fn over items with bounded concurrency. Prevents a fan-out of
// parallel requests from spawning a swarm of LocalStack Lambda containers
// (which exhausts the machine and causes resets).
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

// Resilient fetch — retries transient failures. LocalStack Lambda cold starts
// can drop the connection (ECONNRESET) or return a 5xx the first time; a short
// retry succeeds once the container is warm. Makes the local demo robust.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function resilientFetch(
  input: string,
  init?: RequestInit,
  opts: { retries?: number; delayMs?: number } = {},
): Promise<Response> {
  const retries = opts.retries ?? 3;
  const delayMs = opts.delayMs ?? 1200;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, init);
      // Retry server/proxy errors (cold-start ECONNRESET surfaces as 500/502/504).
      if (res.status >= 500 && attempt < retries) {
        await sleep(delayMs);
        continue;
      }
      return res;
    } catch (e) {
      // Network-level failure (e.g. proxy hang-up) — retry.
      lastErr = e;
      if (attempt < retries) {
        await sleep(delayMs);
        continue;
      }
    }
  }
  throw lastErr ?? new Error("Request failed");
}
