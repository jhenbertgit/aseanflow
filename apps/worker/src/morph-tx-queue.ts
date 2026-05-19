let txChain: Promise<unknown> = Promise.resolve();

/**
 * Serialize all on-chain transactions through a single promise chain.
 * Prevents nonce collisions when multiple workers share the same wallet.
 */
export function enqueueTx<T>(fn: () => Promise<T>): Promise<T> {
  const next = txChain.then(() => fn());
  txChain = next.catch(() => {});
  return next as Promise<T>;
}
