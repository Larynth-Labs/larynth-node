import { describe, expect, it } from "vitest";
import { configure, createWebhook, deleteWebhook, getWebhook, listAssistants, listWebhooks } from "../src";

const baseUrl = process.env.LARYNTH_SMOKE_URL;
const apiKey = process.env.LARYNTH_SMOKE_API_KEY;

describe.skipIf(!baseUrl || !apiKey)("smoke against a seeded core", () => {
  it("lists, creates, reads and deletes a webhook endpoint", async () => {
    configure({ apiKey: apiKey!, baseUrl: baseUrl! });

    const assistants = await listAssistants({ throwOnError: true });
    expect(Array.isArray(assistants.data.data)).toBe(true);

    const created = await createWebhook({
      body: { url: "https://hooks.example.com/larynth-smoke", event_types: ["call.ended"] },
      throwOnError: true,
    });
    expect(created.data.secret.startsWith("whsec_")).toBe(true);
    const id = created.data.id;

    try {
      const fetched = await getWebhook({ path: { id }, throwOnError: true });
      expect(fetched.data.url).toBe("https://hooks.example.com/larynth-smoke");
      expect("secret" in fetched.data).toBe(false);

      const listed = await listWebhooks({ throwOnError: true });
      expect(listed.data.data.some((w) => w.id === id)).toBe(true);
    } finally {
      await deleteWebhook({ path: { id } });
    }
  });
});
