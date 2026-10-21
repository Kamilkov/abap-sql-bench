// Runs fn over items with `concurrency` workers. fn handles its own recoverable errors; anything it throws is
// fatal: no new items are dispatched, in-flight ones finish, then the first error is rethrown.
export async function runQueue<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  const todo = [...items];
  let fatal: unknown;
  const worker = async () => {
    for (let item = todo.shift(); item !== undefined && fatal === undefined; item = todo.shift()) {
      try { await fn(item); } catch (e) { fatal ??= e; }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  if (fatal !== undefined) throw fatal;
}
