/**
 * Utility to wake up the backend (useful for Render free tier which sleeps after 15m).
 * Pings the /health endpoint until it responds with 200 OK.
 * Includes deduplication so multiple concurrent calls only trigger one polling loop.
 */

let wakePromise: Promise<boolean> | null = null;

export async function wakeBackend(): Promise<boolean> {
  if (wakePromise) {
    return wakePromise;
  }

  wakePromise = new Promise(async (resolve) => {
    const maxDuration = 90000; // 90 seconds
    const interval = 3000; // 3 seconds
    const startTime = Date.now();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      console.warn("[wakeBackend] NEXT_PUBLIC_API_URL is not defined.");
      resolve(false);
      return;
    }

    while (Date.now() - startTime < maxDuration) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout per ping

        const res = await fetch(`${apiUrl}/health`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          console.log(`[wakeBackend] Backend is awake! (took ${Date.now() - startTime}ms)`);
          resolve(true);
          wakePromise = null;
          return;
        }
      } catch (err) {
        // Ignore errors (like timeout, 502, 429) during spin-up
      }

      await new Promise((r) => setTimeout(r, interval));
    }

    console.warn("[wakeBackend] Timed out waiting for backend to wake up.");
    resolve(false);
    wakePromise = null;
  });

  return wakePromise;
}
