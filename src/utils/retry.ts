export async function fetchWithRetry<T>(fn:()=>Promise<T>, attempts=3, baseDelay=400): Promise<T> {
  let lastErr: any = null;
  for (let i=0;i<attempts;i++){
    try { return await fn(); } catch (e) { lastErr = e; }
    await new Promise(r => setTimeout(r, baseDelay * (2**i)));
  }
  throw lastErr;
}
