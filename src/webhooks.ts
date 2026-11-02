import { createHmac, timingSafeEqual } from "node:crypto";

export const SECRET_PREFIX = "whsec_";
export const DEFAULT_TOLERANCE_SECONDS = 300;

export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

type HeaderBag = Headers | Record<string, string | string[] | undefined>;

function header(headers: HeaderBag, name: string): string | undefined {
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === name) {
      return Array.isArray(value) ? value.join(" ") : value;
    }
  }
  return undefined;
}

function secretKey(secret: string): Buffer {
  const key = Buffer.from(secret.startsWith(SECRET_PREFIX) ? secret.slice(SECRET_PREFIX.length) : secret, "base64");
  if (key.length === 0) {
    throw new WebhookVerificationError("empty webhook secret");
  }
  return key;
}

export function sign(secret: string, id: string, timestamp: number, body: string | Uint8Array): string {
  const mac = createHmac("sha256", secretKey(secret));
  mac.update(`${id}.${timestamp}.`);
  mac.update(body);
  return `v1,${mac.digest("base64")}`;
}

export interface VerifyOptions {
  toleranceSeconds?: number;
  nowSeconds?: number;
}

export function verify(
  secrets: string | string[],
  headers: HeaderBag,
  body: string | Uint8Array,
  options: VerifyOptions = {},
): void {
  const id = header(headers, "webhook-id");
  const rawTimestamp = header(headers, "webhook-timestamp");
  const signatures = header(headers, "webhook-signature");
  if (!id || !rawTimestamp || !signatures) {
    throw new WebhookVerificationError("missing webhook headers");
  }
  if (!/^\d+$/.test(rawTimestamp)) {
    throw new WebhookVerificationError("invalid webhook-timestamp");
  }
  const timestamp = Number(rawTimestamp);
  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (tolerance > 0 && Math.abs(now - timestamp) > tolerance) {
    throw new WebhookVerificationError("webhook-timestamp outside tolerance");
  }
  const provided = signatures.split(/\s+/).filter(Boolean);
  for (const secret of Array.isArray(secrets) ? secrets : [secrets]) {
    const expected = Buffer.from(sign(secret, id, timestamp, body));
    for (const candidate of provided) {
      const got = Buffer.from(candidate);
      if (got.length === expected.length && timingSafeEqual(got, expected)) {
        return;
      }
    }
  }
  throw new WebhookVerificationError("no matching signature");
}
