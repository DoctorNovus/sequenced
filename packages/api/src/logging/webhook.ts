type WebhookMessage = string | Record<string, unknown>;

export default async function sendToWebhook(message: WebhookMessage): Promise<void> {
    if (!process.env.UPDATES_WEBHOOK_URL) return;

    const payload =
        typeof message === "string"
            ? { content: message }
            : message;

    await fetch(process.env.UPDATES_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    });
}
