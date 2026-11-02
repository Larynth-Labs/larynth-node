# @larynth/sdk

[![npm](https://img.shields.io/npm/v/@larynth/sdk)](https://www.npmjs.com/package/@larynth/sdk)
[![ci](https://github.com/Larynth-Labs/larynth-node/actions/workflows/ci.yml/badge.svg)](https://github.com/Larynth-Labs/larynth-node/actions/workflows/ci.yml)

TypeScript SDK for the Larynth voice AI API, with webhook signature verification. Full docs: https://docs.larynth.com/sdks/typescript

## Install

```sh
npm install @larynth/sdk
```

Requires Node 22.18 or newer.

> **0.x: beta, may change.** Minor versions can include breaking changes until 1.0.

## Authenticate

Create an API key in the Larynth dashboard and keep it in the environment. Never commit it.

```ts
import { configure } from "@larynth/sdk";

configure({
  apiKey: process.env.LARYNTH_API_KEY!,
  baseUrl: "https://api-us.larynth.com",
});
```

## Place a call

Every call needs an `Idempotency-Key`; replays within 24 hours return the stored response.

```ts
import { createCall } from "@larynth/sdk";

const { data: call } = await createCall({
  body: {
    assistant_id: "00000000-0000-0000-0000-000000000000",
    from_e164: "+14155550100",
    to_e164: "+14155550101",
    purpose: "informational",
  },
  headers: { "Idempotency-Key": crypto.randomUUID() },
  throwOnError: true,
});
```

## List assistants

```ts
import { listAssistants } from "@larynth/sdk";

const { data } = await listAssistants({ throwOnError: true });
```

## Verify a webhook signature

Pass the raw request body, not a re-serialized one.

```ts
import { verifyWebhook, WebhookVerificationError } from "@larynth/sdk";

export function handle(headers: Record<string, string>, rawBody: string) {
  try {
    verifyWebhook(process.env.LARYNTH_WEBHOOK_SECRET!, headers, rawBody);
  } catch (error) {
    if (error instanceof WebhookVerificationError) return { status: 400 };
    throw error;
  }
  return { status: 200 };
}
```

## About this repository

This SDK is generated from our OpenAPI spec (`openapi/openapi.json`, synced here on every API change), so generated files are overwritten on every sync. Open issues here; pull requests for docs and examples are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

MIT licensed.
