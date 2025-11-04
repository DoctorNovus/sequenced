export default async function sendToWebhook(message) {
    await fetch(
        process.env.UPDATES_WEBHOOK_URL,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message)
        }
    );
}