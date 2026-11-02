import { client } from "./generated/client.gen";

export * from "./generated";
export { client };
export {
  DEFAULT_TOLERANCE_SECONDS,
  SECRET_PREFIX,
  sign as signWebhook,
  verify as verifyWebhook,
  WebhookVerificationError,
  type VerifyOptions,
} from "./webhooks";

export interface ClientConfig {
  apiKey: string;
  baseUrl: string;
}

export function configure({ apiKey, baseUrl }: ClientConfig) {
  client.setConfig({
    baseUrl,
    auth: (scheme: { scheme?: string }) => (scheme.scheme === "bearer" ? apiKey : undefined),
  });
  return client;
}
