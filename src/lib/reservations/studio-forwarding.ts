/**
 * Constructs TwiML for forwarding a messaging webhook to one specifically
 * configured Twilio Studio Flow URL. This module never makes a network call.
 *
 * IMPORTANT: Generating this TwiML does NOT establish that a particular
 * active Studio Send & Wait execution will resume. That requires an
 * isolated Twilio integration test before enabling routing in production.
 */

const ACCOUNT_SID_PATTERN = /^AC[0-9a-f]{32}$/i;
const FLOW_SID_PATTERN = /^FW[0-9a-f]{32}$/i;

export type StudioRedirectResult =
  | { ok: true; twiml: string; contentType: "text/xml; charset=utf-8" }
  | { ok: false; error: "INVALID_STUDIO_WEBHOOK" };

/**
 * No caller-provided URL or query string is accepted. We only permit the
 * exact expected Twilio Studio Flow webhook shape (HTTPS, official host).
 */
export function buildStudioRedirectTwiml(
  configuredStudioWebhookUrl: string | undefined,
): StudioRedirectResult {
  if (!configuredStudioWebhookUrl) {
    return { ok: false, error: "INVALID_STUDIO_WEBHOOK" };
  }

  let url: URL;
  try {
    url = new URL(configuredStudioWebhookUrl);
  } catch {
    return { ok: false, error: "INVALID_STUDIO_WEBHOOK" };
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "webhooks.twilio.com" ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    url.pathname.endsWith("/")
  ) {
    return { ok: false, error: "INVALID_STUDIO_WEBHOOK" };
  }

  const match = /^\/v1\/Accounts\/(AC[0-9a-f]{32})\/Flows\/(FW[0-9a-f]{32})$/i.exec(
    url.pathname,
  );
  if (!match) {
    return { ok: false, error: "INVALID_STUDIO_WEBHOOK" };
  }

  return {
    ok: true,
    contentType: "text/xml; charset=utf-8",
    twiml: `<?xml version="1.0" encoding="UTF-8"?><Response><Redirect method="POST">${url.toString()}</Redirect></Response>`,
  };
}
