export function validSharedActivationOrigin(
  request: Request
): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    const source = new URL(origin);
    const target = new URL(request.url);

    if (source.origin !== target.origin) {
      return false;
    }

    if (
      source.protocol === "https:" &&
      target.protocol === "https:"
    ) {
      return true;
    }

    const localHosts = new Set([
      "localhost",
      "127.0.0.1",
      "[::1]",
    ]);

    return (
      process.env.NODE_ENV === "development" &&
      source.protocol === "http:" &&
      target.protocol === "http:" &&
      localHosts.has(source.hostname) &&
      localHosts.has(target.hostname)
    );
  } catch {
    return false;
  }
}