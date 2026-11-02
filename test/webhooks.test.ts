import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { sign, verify, WebhookVerificationError } from "../src/webhooks";

interface Vectors {
  cases: { name: string; secret: string; id: string; timestamp: number; body: string; signature: string }[];
  verify: { name: string; case: number; header: string; valid: boolean }[];
}

const vectors: Vectors = JSON.parse(readFileSync(new URL("../webhook-vectors.json", import.meta.url), "utf8"));

describe("webhook signing vectors", () => {
  for (const c of vectors.cases) {
    it(`signs ${c.name}`, () => {
      expect(sign(c.secret, c.id, c.timestamp, c.body)).toBe(c.signature);
    });
  }
});

describe("webhook verification vectors", () => {
  for (const v of vectors.verify) {
    it(v.name, () => {
      const c = vectors.cases[v.case]!;
      const headers = {
        "Webhook-Id": c.id,
        "Webhook-Timestamp": String(c.timestamp),
        "Webhook-Signature": v.header,
      };
      const run = () => verify(c.secret, headers, c.body, { nowSeconds: c.timestamp });
      if (v.valid) {
        expect(run).not.toThrow();
      } else {
        expect(run).toThrow(WebhookVerificationError);
      }
    });
  }
});

describe("webhook verification rules", () => {
  const c = vectors.cases[0]!;
  const base = { "webhook-id": c.id, "webhook-timestamp": String(c.timestamp), "webhook-signature": c.signature };

  it("rejects timestamps outside tolerance", () => {
    expect(() => verify(c.secret, base, c.body, { nowSeconds: c.timestamp + 301 })).toThrow(WebhookVerificationError);
    expect(() => verify(c.secret, base, c.body, { nowSeconds: c.timestamp - 301 })).toThrow(WebhookVerificationError);
    expect(() => verify(c.secret, base, c.body, { nowSeconds: c.timestamp + 300 })).not.toThrow();
  });

  it("rejects missing headers and tampered bodies", () => {
    expect(() => verify(c.secret, {}, c.body)).toThrow(WebhookVerificationError);
    expect(() => verify(c.secret, base, c.body + " ", { nowSeconds: c.timestamp })).toThrow(WebhookVerificationError);
  });

  it("accepts either secret during rotation", () => {
    const other = vectors.cases[1]!.secret;
    expect(() => verify([other, c.secret], base, c.body, { nowSeconds: c.timestamp })).not.toThrow();
    expect(() => verify([other], base, c.body, { nowSeconds: c.timestamp })).toThrow(WebhookVerificationError);
  });

  it("reads a fetch Headers object", () => {
    const headers = new Headers(base);
    expect(() => verify(c.secret, headers, c.body, { nowSeconds: c.timestamp })).not.toThrow();
  });
});
