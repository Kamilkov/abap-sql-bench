// JSON POST with retries on network errors, 408/409/429/5xx (honours retry-after).
export async function post(url: string, headers: Record<string, string>, body: unknown, retryBaseMs = 1000): Promise<any> {
  for (let attempt = 0; ; attempt++) {
    let r: Response;
    try {
      r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    } catch (e) {
      if (attempt >= 5) throw e;
      await new Promise((res) => setTimeout(res, 2 ** attempt * retryBaseMs));
      continue;
    }
    if (r.ok) return r.json();
    const text = await r.text();
    if (!(r.status === 408 || r.status === 409 || r.status === 429 || r.status >= 500) || attempt >= 5) {
      throw new Error(`HTTP ${r.status}: ${text.slice(0, 300)}`);
    }
    const retryAfter = Number(r.headers.get('retry-after')) || 0;
    await new Promise((res) => setTimeout(res, retryAfter * 1000 || 2 ** attempt * retryBaseMs));
  }
}
